import {PrismaClient} from '../../generated/prisma/index.js'
const prisma = new PrismaClient();


export const identifyController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'At least one of email or phoneNumber is required' });
        }

        // 1. Find all contacts matching email or phoneNumber
        const matchedContacts = await prisma.contact.findMany({
        where: {
            OR: [
            { email: email || undefined },
            { phoneNumber: phoneNumber || undefined }
            ]
        }
        });

        let allRelatedContacts = [...matchedContacts];

        // 2. Expand search: find contacts linked to any of the matched ones
        for (const contact of matchedContacts) {
            if (contact.linkedId) {
                const linkedContacts = await prisma.contact.findMany({
                    where: {
                        OR: [
                        { id: contact.linkedId },
                        { linkedId: contact.linkedId }
                        ]
                    }
                });
                allRelatedContacts.push(...linkedContacts);
            }
        }

        // 3. Remove duplicates
        const seenIds = new Set();
        const uniqueContacts = [];

        for (const contact of allRelatedContacts) {
            if (!seenIds.has(contact.id)) {
                seenIds.add(contact.id);
                uniqueContacts.push(contact);
            }
        }

        allRelatedContacts = uniqueContacts;


        // 4. Determine the primary contact (oldest one)
        let primaryContact = allRelatedContacts.find(c => c.linkPrecedence === 'primary');
        // if all are secondary then return first secondary
        if (!primaryContact && allRelatedContacts.length) {
            // fallback if no explicit primary
            primaryContact = allRelatedContacts.reduce((prev, curr) => prev.createdAt < curr.createdAt ? prev : curr);
        }

        // 5. If no existing contact, create new primary
        if (!primaryContact) {
            const newPrimary = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'primary'
                }
            });

            return res.json({
                contact: {
                    primaryContatctId: newPrimary.id,
                    emails: [newPrimary.email],
                    phoneNumbers: [newPrimary.phoneNumber],
                    secondaryContactIds: []
                }
            });
        }

        // 6. If new info (email or phone not yet recorded), create a secondary
        const alreadyExists = allRelatedContacts.some(c =>
            c.email === email && c.phoneNumber === phoneNumber
        );

        if (!alreadyExists) {
            const newSecondary = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'secondary',
                    linkedId: primaryContact.id
                }
            });

            allRelatedContacts.push(newSecondary);
        }

        // 7. Normalize and prepare response
        const emails = [...new Set(allRelatedContacts.map(c => c.email).filter(Boolean))];
        const phones = [...new Set(allRelatedContacts.map(c => c.phoneNumber).filter(Boolean))];
        const secondaryIds = allRelatedContacts
        .filter(c => c.linkPrecedence === 'secondary')
        .map(c => c.id);

        res.json({
            contact: {
                primaryContatctId: primaryContact.id,
                emails,
                phoneNumbers: phones,
                secondaryContactIds: secondaryIds
            }
        });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
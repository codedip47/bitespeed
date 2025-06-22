# Bitespeed Backend Identity Reconciliation

This is a backend service built for the Bitespeed Identity Reconciliation task. It uses **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM** to manage customer contact data across multiple sessions and purchases.

## 🧠 Problem Statement

Customers often use different emails or phone numbers while ordering, making it difficult to identify unique users. This service handles:

- Identifying if a user already exists based on email/phone
- Linking related contacts to a primary identity
- Returning consolidated contact details via `/identify` endpoint

---

## 🚀 Tech Stack

- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Hosting**: Render

---

## 📦 Installation

```bash
git clone https://github.com/codedip47/bitespeed.git
cd bitespeed
npm install

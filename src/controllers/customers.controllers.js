import { db } from "../database/database.connection.js";

export async function customers(req, res) {
    try {
        const customers = await db.query(`SELECT * FROM customers;`)
        res.send(customers.rows)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function customersById(req, res) {
    const { id } = req.params

    try {
        const customer = await db.query(`SELECT customers.* FROM customers WHERE customers.id = $1;`, [id])
        res.send(customer.rows[0])

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function newCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body

    try {

        const customerVerification = await db.query(`SELECT customers.cpf FROM customers WHERE customers.cpf = $1;`, [cpf])

        if (customerVerification.rowCount) {
            return res.sendStatus(409)
        }

        await db.query(`INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4);`, [name, phone, cpf, birthday])

        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function updateCustomer(req, res) {

    const { id } = req.params
    const { name, phone, cpf, birthday } = req.body

    try {
        const customerVerification = await db.query(
            `SELECT * FROM customers WHERE cpf=$1 AND id <> $2`,
            [cpf, id]
          )
          if (customerVerification.rowCount !== 0) return res.sendStatus(409)
    
        await db.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 
        WHERE id = $5;`, [name, phone, cpf, birthday, id])

        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
}
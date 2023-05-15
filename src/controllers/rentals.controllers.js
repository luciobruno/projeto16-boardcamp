import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function rentals(req, res) {
    try {

        const rentals = await db.query(`SELECT rentals.*, games.name AS "nameOfGame", 
        customers.name AS "nameOfCustomer" 
        FROM rentals JOIN games ON games.id = rentals."gameId"
        JOIN customers ON customers.id = rentals."customerId";`)

        const newRentals = rentals.rows.map((rental)=>{

            const list = {
                id: rental.id,
                customerId: rental.customerId,
                gameId: rental.gameId,
                rentDate: dayjs(rental.rentDate).format("YYYY-MM-DD"),
                daysRented: rental.daysRented,
                returnDate: rental.returnDate,
                originalPrice: rental.originalPrice,
                delayFee: rental.delayFee,
                customer:{
                    id:rental.customerId,
                    name: rental.nameOfCustomer
                },
                game:{
                    id:rental.gameId,
                    name:rental.nameOfGame
                }
            }

            return list
        })

        res.send(newRentals)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function newRental(req, res) {

    const { customerId, gameId, daysRented } = req.body

    try {

        const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [customerId])
        const game = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId])

        if (customer.rowCount === 0 || game.rowCount === 0 || daysRented <= 0 || game.rows[0].stockTotal === 0) {
            return res.sendStatus(400)
        }

        const rentDate = dayjs().format("YYYY-MM-DD")
        const originalPrice = (game.rows[0].pricePerDay) * daysRented

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1,$2,$3,$4,$5,$6,$7);`, [customerId, gameId, rentDate, daysRented, null, originalPrice, null])

        const stockToday = (game.rows[0].stockTotal) - 1

        await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id=$2;`, [stockToday, gameId])

        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function rentalFinalization(req, res) {

    const { id } = req.params

    try {

        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])

        if (rental.rowCount === 0) {
            return res.sendStatus(404)
        }

        if (rental.rows[0].returnDate !== null) {
            return res.sendStatus(400)
        }

        const dateToday = dayjs()

        const dateOfRental = rental.rows[0].rentDate
        const daysOfRental = rental.rows[0].daysRented

        const diff = dateToday.diff(dateOfRental, 'day')
        let delayFee = 0

        if (daysOfRental < diff) {
            const number = diff - dateOfRental
            delayFee = ((rental.rows[0].originalPrice) / daysOfRental) * number
        }

        await db.query(`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3;`, [dateToday, delayFee, id])

        const gameId = rental.rows[0].gameId

        const game = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId])

        const stockToday = (game.rows[0].stockTotal) + 1

        await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id=$2;`, [stockToday, gameId])

        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function deleteRental(req, res) {

    const { id } = req.params

    try {

        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])

        if (rental.rowCount === 0) {
            return res.sendStatus(404)
        }

        if (rental.rows[0].returnDate === null) {
            return res.sendStatus(400)
        }

        db.query(`DELETE FROM rentals WHERE id=$1;`, [id])

        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
}
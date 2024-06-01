import mongoose from 'mongoose';
import Product from '../src/dao/manager/products.dao.js';
import Assert from 'assert';
// import chai from 'chai'
import config from '../src/config/config.js'
import { faker } from '@faker-js/faker'

const mongoURL = config.mongoURL

mongoose.connect(mongoURL)

const assert = Assert.strict
// const expect = chai.expect

describe('Testing Product DAO', () => {
    before(async function () {
        this.productDao = new Product()
    })
    beforeEach(async function () {
        try {
            await mongoose.connection.collections.products.drop()
        } catch (err) {}
    })

    it('El get debe devolver los productos en un arreglo', async function () {
        const result = await this.productDao.getAll()

        assert.strictEqual(Array.isArray(result), true)
        // expect(result).to.be.deep.equal([])
    })
    it('El DAO debe poder crear productos', async function () {
        const result = await this.productDao.create({
            title: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            code: faker.string.nanoid(10),
            status: true,
            price: parseFloat(faker.commerce.price()),
            stock: parseInt(faker.number.int({ min: 20, max: 100 })),
            category: faker.commerce.department(),
            thumbnail: [faker.image.url()],
        })
        assert.ok(result._id)
    })
})
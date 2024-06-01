import { expect } from 'chai';
import supertest from 'supertest'

const requester = supertest('http://localhost:8080')

describe('Testing de E-commerce de Backend', () => {
    it('Debe leer los productos del carrito y devolver status 200', async () => {
        const cid = '66041b3ad468db9649001fd3'
        const response = await requester.get(`/api/carts/${cid}`)
        
        expect(response.status).to.equal(200)
    })
})
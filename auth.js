import jwt from 'jsonwebtoken'

const secret = process.env.SECRET

export const context = ({ req, res }) => {
    const token = req.headers.authorization || ''
    if (!token) return { verified: false }

    try {
        const info = jwt.verify(token, secret)
        return { verified: true, userId: info.id }
    } catch (e) {
        return { verified: false }
    }
}

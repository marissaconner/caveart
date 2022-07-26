import Express from 'express'
import comicController from '../controllers/comicController'
const comicRoutes = Express.Router()
import { Request, Response } from 'express'

comicRoutes.get('/by/:author', comicController.getByAuthor)
comicRoutes.get('/mine', comicController.getByEndUser)
comicRoutes.get('/recent', comicController.getRecent)
comicRoutes.get('/page/:comic/:page', comicController.getPage)
comicRoutes.get('/pagecount/:comic', comicController.getPageCount)
comicRoutes.post('/new', comicController.create)
comicRoutes.post('/upload', comicController.addPage)


export default comicRoutes
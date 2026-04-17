import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import * as projectService from '../services/project.service'
import { sendSuccess } from '../utils/response'

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject({
      ...req.body,
      createdById:   req.user!.id,
      createdByName: req.user!.email,
      createdByEmail: req.user!.email,
    })
    sendSuccess(res, project, 'Project created successfully', 201)
  } catch (err) { next(err) }
}

export async function getProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Accept both cuid id and slug
    const { id } = req.params
    const project = id.startsWith('c')
      ? await projectService.getProject(id)
      : await projectService.getProjectBySlug(id)
    sendSuccess(res, project)
  } catch (err) { next(err) }
}

export async function listProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await projectService.listProjects(req.query as Record<string, string>)
    sendSuccess(res, result.projects, 'Projects retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body)
    sendSuccess(res, project, 'Project updated')
  } catch (err) { next(err) }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.params.id)
    sendSuccess(res, null, 'Project deleted')
  } catch (err) { next(err) }
}

export async function generateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, category } = req.body
    const generated = await projectService.generateProject(title, category)
    sendSuccess(res, generated, 'Project content generated')
  } catch (err) { next(err) }
}

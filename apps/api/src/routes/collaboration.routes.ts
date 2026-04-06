import express from "express";
import { CollaborationController } from "../controllers/Collaboration.controller.js";
import { auth, AuthRequest } from "../middleware/auth.js";

const router : express.Router = express.Router();

router.use((req: AuthRequest, res, next) => {
  auth(req, res, () => {
    (req as any).userId = req.user?.userId;
    next();
  });
});


router.post("/invite", CollaborationController.inviteCollaborator);
router.post("/invite/accept", CollaborationController.acceptInvite);
router.post("/invite/reject", CollaborationController.rejectInvite);


router.delete("/collaborator", CollaborationController.removeCollaborator);
router.patch("/collaborator/role", CollaborationController.updateCollaboratorRole);

router.get("/my-invites", CollaborationController.getMyPendingInvites);

router.get("/:repoId/collaborators", CollaborationController.getCollaborators);
router.get("/:repoId/invites", CollaborationController.getPendingInvites);
router.get("/:repoId/messages", CollaborationController.getMessages);
router.get("/:repoId/activity", CollaborationController.getActivityLog);

export default router;

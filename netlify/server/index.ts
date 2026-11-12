import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { body, param, validationResult } from "express-validator";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { comments, postLikes, posts } from "../../db/schema.ts";

export const config = {
  path: "/api/*",
};

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array();
    return res.status(400).json({ message: list[0]?.msg || "Validation failed", errors: list });
  }
  next();
};

const idParam = param("id").isInt({ min: 1 }).withMessage("Invalid post ID").toInt();

type PostRow = typeof posts.$inferSelect;

// Build the response shape the frontend expects.
async function hydrate(rows: PostRow[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);
  const [commentRows, likeRows] = await Promise.all([
    db.select().from(comments).where(inArray(comments.postId, ids)).orderBy(asc(comments.createdAt)),
    db.select().from(postLikes).where(inArray(postLikes.postId, ids)),
  ]);

  return rows.map((p) => {
    const likedBy = likeRows.filter((l) => l.postId === p.id).map((l) => l.userId);
    return {
      _id: String(p.id),
      title: p.title,
      content: p.content,
      author: p.author,
      timestamp: p.createdAt,
      likes: likedBy.length,
      likedBy,
      comments: commentRows
        .filter((c) => c.postId === p.id)
        .map((c) => ({ _id: String(c.id), author: c.author, content: c.content, timestamp: c.createdAt })),
    };
  });
}

async function findPost(id: number) {
  const [row] = await db.select().from(posts).where(eq(posts.id, id));
  if (!row) return null;
  const [post] = await hydrate([row]);
  return post;
}

const router = express.Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  res.json(await hydrate(rows));
});

router.get("/:id", idParam, handleValidationErrors, async (req: Request, res: Response) => {
  const post = await findPost(Number(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.post(
  "/",
  [
    body("title").isString().trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("content").isString().trim().isLength({ min: 10, max: 5000 }).withMessage("Content must be between 10 and 5000 characters"),
    body("author").isString().trim().isLength({ min: 2, max: 50 }).withMessage("Author name must be between 2 and 50 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const [row] = await db
      .insert(posts)
      .values({ title: req.body.title, content: req.body.content, author: req.body.author })
      .returning();
    const [post] = await hydrate([row]);
    res.status(201).json(post);
  }
);

router.patch(
  "/:id",
  [
    idParam,
    body("title").optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("content").optional().isString().trim().isLength({ min: 10, max: 5000 }).withMessage("Content must be between 10 and 5000 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updates: Partial<Pick<PostRow, "title" | "content">> = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.content) updates.content = req.body.content;

    if (Object.keys(updates).length > 0) {
      const updated = await db.update(posts).set(updates).where(eq(posts.id, id)).returning({ id: posts.id });
      if (updated.length === 0) return res.status(404).json({ message: "Post not found" });
    }
    const post = await findPost(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  }
);

router.patch(
  "/:id/like",
  [idParam, body("userId").optional().isString().trim().isLength({ min: 1, max: 100 })],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId: string = req.body.userId || "anonymous";

    const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id));
    if (!exists) return res.status(404).json({ message: "Post not found" });

    const removed = await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, id), eq(postLikes.userId, userId)))
      .returning();
    if (removed.length === 0) {
      await db.insert(postLikes).values({ postId: id, userId }).onConflictDoNothing();
    }
    res.json(await findPost(id));
  }
);

router.post(
  "/:id/comments",
  [
    idParam,
    body("author").isString().trim().isLength({ min: 2, max: 50 }).withMessage("Author name must be between 2 and 50 characters"),
    body("content").isString().trim().isLength({ min: 1, max: 1000 }).withMessage("Comment must be between 1 and 1000 characters"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id));
    if (!exists) return res.status(404).json({ message: "Post not found" });

    await db.insert(comments).values({ postId: id, author: req.body.author, content: req.body.content });
    res.status(201).json(await findPost(id));
  }
);

router.delete("/:id", idParam, handleValidationErrors, async (req: Request, res: Response) => {
  const deleted = await db.delete(posts).where(eq(posts.id, Number(req.params.id))).returning({ id: posts.id });
  if (deleted.length === 0) return res.status(404).json({ message: "Post not found" });
  res.json({ message: "Post deleted successfully" });
});

app.use("/api/posts", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(process.env.PORT);

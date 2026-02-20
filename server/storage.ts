import { type User, type InsertUser, type Post, type InsertPost, type Vote, type InsertVote, type Report, type InsertReport, type Favorite, type InsertFavorite, type Comment, type InsertComment, type CommentVote, type InsertCommentVote, type CommentReport, type InsertCommentReport, type PostWithVote, type CommentWithVote, type PostMetadata } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: string, updates: { totalPosts?: number; totalVotesReceived?: number }): Promise<User | undefined>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPosts(filters?: { animal?: string; userId?: string; limit?: number; offset?: number }): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  deleteVote(postId: string, userId: string): Promise<boolean>;
  getUserVote(postId: string, userId: string): Promise<Vote | undefined>;
  updatePostVoteCount(postId: string): Promise<void>;

  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getUserReport(postId: string, userId: string): Promise<Report | undefined>;

  // Favorite methods
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(postId: string, userId: string): Promise<boolean>;
  getUserFavorite(postId: string, userId: string): Promise<Favorite | undefined>;
  getUserFavorites(userId: string): Promise<Post[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getComment(id: string): Promise<Comment | undefined>;
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  getCommentsWithVotes(postId: string, userId: string): Promise<CommentWithVote[]>;
  deleteComment(id: string): Promise<boolean>;
  
  // Comment vote methods
  createCommentVote(vote: InsertCommentVote): Promise<CommentVote>;
  deleteCommentVote(commentId: string, userId: string): Promise<boolean>;
  getUserCommentVote(commentId: string, userId: string): Promise<CommentVote | undefined>;
  updateCommentVoteCount(commentId: string): Promise<void>;
  
  // Comment report methods
  createCommentReport(report: InsertCommentReport): Promise<CommentReport>;
  getUserCommentReport(commentId: string, userId: string): Promise<CommentReport | undefined>;
  
  // Combined methods
  getPostsWithVotes(userId: string, filters?: { animal?: string; limit?: number; offset?: number }): Promise<PostWithVote[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private votes: Map<string, Vote>;
  private reports: Map<string, Report>;
  private favorites: Map<string, Favorite>;
  private commentVotes: Map<string, CommentVote>;
  private commentReports: Map<string, CommentReport>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.votes = new Map();
    this.reports = new Map();
    this.favorites = new Map();
    this.comments = new Map();
    this.commentVotes = new Map();
    this.commentReports = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      bio: insertUser.bio || null,
      avatar: insertUser.avatar || "🐹",
      totalPosts: 0,
      totalVotesReceived: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStats(userId: string, updates: { totalPosts?: number; totalVotesReceived?: number }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    if (updates.totalPosts !== undefined) {
      user.totalPosts = updates.totalPosts;
    }
    if (updates.totalVotesReceived !== undefined) {
      user.totalVotesReceived = updates.totalVotesReceived;
    }

    this.users.set(userId, user);
    return user;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      audioData: insertPost.audioData ?? null,
      duration: insertPost.duration ?? null,
      confidence: insertPost.confidence ?? null,
      metadata: insertPost.metadata ?? null,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(filters?: { animal?: string; userId?: string; limit?: number; offset?: number }): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters?.animal) {
      posts = posts.filter(p => p.animal === filters.animal);
    }
    if (filters?.userId) {
      posts = posts.filter(p => p.userId === filters.userId);
    }
    
    // Sort by creation date, newest first
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return posts.slice(offset, offset + limit);
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async deletePost(id: string): Promise<boolean> {
    Array.from(this.votes.entries()).forEach(([voteId, vote]) => {
      if (vote.postId === id) this.votes.delete(voteId);
    });
    Array.from(this.reports.entries()).forEach(([reportId, report]) => {
      if (report.postId === id) this.reports.delete(reportId);
    });
    Array.from(this.favorites.entries()).forEach(([favoriteId, favorite]) => {
      if (favorite.postId === id) this.favorites.delete(favoriteId);
    });
    Array.from(this.comments.entries()).forEach(([commentId, comment]) => {
      if (comment.postId === id) this.comments.delete(commentId);
    });
    return this.posts.delete(id);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = {
      ...insertVote,
      id,
      createdAt: new Date(),
    };
    
    // Delete any existing vote by this user on this post
    await this.deleteVote(insertVote.postId, insertVote.userId);
    
    this.votes.set(id, vote);
    await this.updatePostVoteCount(insertVote.postId);
    return vote;
  }

  async deleteVote(postId: string, userId: string): Promise<boolean> {
    const existingVote = Array.from(this.votes.entries()).find(
      ([_, vote]) => vote.postId === postId && vote.userId === userId
    );
    
    if (existingVote) {
      this.votes.delete(existingVote[0]);
      await this.updatePostVoteCount(postId);
      return true;
    }
    return false;
  }

  async getUserVote(postId: string, userId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.postId === postId && vote.userId === userId
    );
  }

  async updatePostVoteCount(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) return;

    const postVotes = Array.from(this.votes.values()).filter(v => v.postId === postId);
    const upvotes = postVotes.filter(v => v.voteType === 'up').length;
    const downvotes = postVotes.filter(v => v.voteType === 'down').length;

    post.upvotes = upvotes;
    post.downvotes = downvotes;
    this.posts.set(postId, post);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const existingReport = await this.getUserReport(insertReport.postId, insertReport.userId);
    if (existingReport) return existingReport;

    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      reason: insertReport.reason ?? null,
      id,
      createdAt: new Date(),
    };

    this.reports.set(id, report);
    return report;
  }

  async getUserReport(postId: string, userId: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(
      (report) => report.postId === postId && report.userId === userId
    );
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const existingFavorite = await this.getUserFavorite(insertFavorite.postId, insertFavorite.userId);
    if (existingFavorite) return existingFavorite;

    const id = randomUUID();
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };

    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(postId: string, userId: string): Promise<boolean> {
    const existingFavorite = Array.from(this.favorites.entries()).find(
      ([_, favorite]) => favorite.postId === postId && favorite.userId === userId
    );

    if (existingFavorite) {
      this.favorites.delete(existingFavorite[0]);
      return true;
    }

    return false;
  }

  async getUserFavorite(postId: string, userId: string): Promise<Favorite | undefined> {
    return Array.from(this.favorites.values()).find(
      (favorite) => favorite.postId === postId && favorite.userId === userId
    );
  }

  async getUserFavorites(userId: string): Promise<Post[]> {
    const favoritePostIds = Array.from(this.favorites.values())
      .filter((favorite) => favorite.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((favorite) => favorite.postId);

    return favoritePostIds
      .map((postId) => this.posts.get(postId))
      .filter((post): post is Post => !!post);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      id,
      postId: insertComment.postId,
      userId: insertComment.userId ?? null,
      anonymousId: insertComment.anonymousId ?? null,
      username: insertComment.username,
      text: insertComment.text,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
    };

    this.comments.set(id, comment);
    return comment;
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const comments = Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return comments;
  }

  async getCommentsWithVotes(postId: string, userId: string): Promise<CommentWithVote[]> {
    const comments = await this.getCommentsByPostId(postId);
    
    return Promise.all(comments.map(async (comment) => {
      const userVote = await this.getUserCommentVote(comment.id, userId);
      return {
        ...comment,
        userVote: userVote?.voteType as 'up' | 'down' | undefined || null,
      };
    }));
  }

  async deleteComment(id: string): Promise<boolean> {
    // Delete associated votes and reports
    Array.from(this.commentVotes.entries()).forEach(([voteId, vote]) => {
      if (vote.commentId === id) this.commentVotes.delete(voteId);
    });
    Array.from(this.commentReports.entries()).forEach(([reportId, report]) => {
      if (report.commentId === id) this.commentReports.delete(reportId);
    });
    return this.comments.delete(id);
  }

  // Comment vote methods
  async createCommentVote(insertVote: InsertCommentVote): Promise<CommentVote> {
    const id = randomUUID();
    const vote: CommentVote = {
      ...insertVote,
      id,
      createdAt: new Date(),
    };
    
    // Delete any existing vote by this user on this comment
    await this.deleteCommentVote(insertVote.commentId, insertVote.userId);
    
    this.commentVotes.set(id, vote);
    await this.updateCommentVoteCount(insertVote.commentId);
    return vote;
  }

  async deleteCommentVote(commentId: string, userId: string): Promise<boolean> {
    const existingVote = Array.from(this.commentVotes.entries()).find(
      ([_, vote]) => vote.commentId === commentId && vote.userId === userId
    );
    
    if (existingVote) {
      this.commentVotes.delete(existingVote[0]);
      await this.updateCommentVoteCount(commentId);
      return true;
    }
    return false;
  }

  async getUserCommentVote(commentId: string, userId: string): Promise<CommentVote | undefined> {
    return Array.from(this.commentVotes.values()).find(
      (vote) => vote.commentId === commentId && vote.userId === userId
    );
  }

  async updateCommentVoteCount(commentId: string): Promise<void> {
    const comment = this.comments.get(commentId);
    if (!comment) return;

    const commentVotes = Array.from(this.commentVotes.values()).filter(v => v.commentId === commentId);
    const upvotes = commentVotes.filter(v => v.voteType === 'up').length;
    const downvotes = commentVotes.filter(v => v.voteType === 'down').length;

    comment.upvotes = upvotes;
    comment.downvotes = downvotes;
    this.comments.set(commentId, comment);
  }

  // Comment report methods
  async createCommentReport(insertReport: InsertCommentReport): Promise<CommentReport> {
    const existingReport = await this.getUserCommentReport(insertReport.commentId, insertReport.userId);
    if (existingReport) return existingReport;

    const id = randomUUID();
    const report: CommentReport = {
      ...insertReport,
      reason: insertReport.reason ?? null,
      id,
      createdAt: new Date(),
    };

    this.commentReports.set(id, report);
    return report;
  }

  async getUserCommentReport(commentId: string, userId: string): Promise<CommentReport | undefined> {
    return Array.from(this.commentReports.values()).find(
      (report) => report.commentId === commentId && report.userId === userId
    );
  }

  async getPostsWithVotes(userId: string, filters?: { animal?: string; userId?: string; limit?: number; offset?: number }): Promise<PostWithVote[]> {
    const posts = await this.getPosts(filters);
    
    return Promise.all(posts.map(async (post) => {
      const userVote = await this.getUserVote(post.id, userId);
      const userFavorite = await this.getUserFavorite(post.id, userId);
      const comments = await this.getCommentsByPostId(post.id);
      return {
        ...post,
        metadata: post.metadata as PostMetadata | undefined,
        userVote: userVote?.voteType as 'up' | 'down' | undefined || null,
        isFavorited: !!userFavorite,
        commentCount: comments.length,
      };
    }));
  }
}

export const storage = new MemStorage();

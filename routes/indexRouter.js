const express = require('express');
const router = express.Router();
const isAuth = require('../isAuth');
const pool = require('../db');

router.get('/account', isAuth, (req, res) => {
  const user = {
    ...req.user,
    loggedIn: true,
  };

  res.status(200).json(user);
});

router.post('/new_post', isAuth, async (req, res) => {
  try {
    const newPost = await pool.query(
      'INSERT INTO post (title, body, author_id) VALUES ($1, $2, $3) RETURNING id',
      [req.body.title, req.body.post, req.user.id]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error(
      'Something went wrong while making a new post: ',
      err.message
    );
    res.status(500).end();
    //throw err;
  }
});

router.get('/feed', isAuth, async (req, res) => {
  const cursor = req.query.cursor;
  const timeZone = 'CET';
  const timestamptzFormat = 'FMDD Mon';

  try {
    const posts = await pool.query(
      'SELECT u.username, u.img, p.id, p.title, p.body, TO_CHAR(p.created_at AT TIME ZONE $1, $2) AS created_at FROM "user" u INNER JOIN post p ON u.id = p.author_id ORDER BY p.id DESC LIMIT 5 OFFSET $3',
      [timeZone, timestamptzFormat, cursor]
    );
    res.status(200).json({ nextCursor: cursor * 1 + 5, posts: posts.rows });
  } catch (err) {
    console.error('Something went wrong while fetching feed: ', err.message);
    res.status(500).end();
    //throw err;
  }
});

router.get('/my_posts', isAuth, async (req, res) => {
  const cursor = req.query.cursor;
  const timeZone = 'CET';
  const timestamptzFormat = 'FMDD Mon';

  try {
    const userPosts = await pool.query(
      'SELECT u.username, u.img, p.id, p.title, p.body, TO_CHAR(p.created_at AT TIME ZONE $1, $2) AS created_at FROM "user" u INNER JOIN post p ON u.id = p.author_id WHERE p.author_id = $3 ORDER BY p.id DESC LIMIT 5 OFFSET $4',
      [timeZone, timestamptzFormat, req.user.id, cursor]
    );
    res.status(200).json({ nextCursor: cursor * 1 + 5, posts: userPosts.rows });
  } catch (err) {
    console.error(
      'Something went wrong while fetching the user posts: ',
      err.message
    );
    res.status(500).end();
    //throw err;
  }
});

router.get('/post/:id', isAuth, async (req, res) => {
  const { id } = req.params;
  const timeZone = 'CET';
  const timestamptzFormat = 'FMDD Mon, YYYY';

  if (isNaN(id)) {
    res.status(400).end();
  } else
    try {
      const postDetails = await pool.query(
        'SELECT u.username, u.img, p.author_id, p.title, p.body, TO_CHAR(p.created_at AT TIME ZONE $1, $2) AS created_at FROM "user" u INNER JOIN post p ON u.id = p.author_id WHERE p.id = $3',
        [timeZone, timestamptzFormat, id]
      );
      if (postDetails.rowCount === 0) {
        return res.status(404).end('Post Not Found.');
      }
      res.status(200).json(postDetails.rows[0]);
    } catch (err) {
      console.error(
        'Something went wrong while fetching post details: ',
        err.message
      );
      res.status(500).end();
      //throw err;
    }
});

router.delete('/post/:post_id/delete', isAuth, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.user.id;

  try {
    const deletePost = await pool.query(
      'DELETE FROM post WHERE id = $1 AND author_id = $2',
      [post_id, user_id]
    );
    if (deletePost.rowCount === 0) {
      return res.status(404).end('Post does not exist!');
    }
    res.status(204).end();
  } catch (err) {
    console.error('Something went wrong while deleting post: ', err.message);
    res.status(500).end();
    //throw err;
  }
});

module.exports = router;

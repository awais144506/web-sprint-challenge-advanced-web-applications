import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)
  const token = localStorage.getItem("token");
  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { /* ✨ implement */
    navigate("/")
  }
  const redirectToArticles = () => { /* ✨ implement */
    navigate("/articles")
  }

  const logout = () => {
    localStorage.removeItem("token")
    redirectToLogin()
    setMessage("Goodbye!")
  }

  const login = async ({ username, password }) => {
    setSpinnerOn(true);
    setMessage("")
    try {
      const { data } = await axios.post(loginUrl, { username, password });
      localStorage.setItem("token", data.token);
      redirectToArticles();
    } catch (err) {
      console.error("Error logging in:", err);
      setMessage("Failed to log in. Please check your username and password.");
    } finally {

      setSpinnerOn(false);
    }
  }

  const getArticles = async () => {
    setSpinnerOn(true);
    setMessage("");
    try {

      const response = await axios.get(articlesUrl, {
        headers: { Authorization: token },
      });

      setArticles(response.data.articles);
      setMessage(response.data.message);

    } catch (error) {
      if (error?.response?.status === 401) {
        logout();
      } else {
        setMessage("Failed to load articles. Please try again.");
      }
      console.error("Error fetching articles:", error);

    } finally {
      setSpinnerOn(false);
    }
  }

  const postArticle = async (article) => {
    setSpinnerOn(true);
    setMessage("");
    try {
      const response = await axios.post(
        articlesUrl,
        {
          title: article.title,
          text: article.text,
          topic: article.topic,
        },
        { headers: { Authorization: token } }
      );


      const newArticle = response.data.article;
      setArticles((prevArticles) => [...prevArticles, newArticle]);
      setMessage(response.data.message);

    } catch (error) {
      console.log("There is an error in posting", error);


      const errorMessage = error.response?.data?.message || "Failed to post article. Please try again.";
      setMessage(errorMessage);

    } finally {
      setSpinnerOn(false);
    }
  };


  const updateArticle = async (article_id, article) => {
    setSpinnerOn(true);
    setMessage("");

    try {
      const response = await axios.put(
        `${articlesUrl}/${article_id}`,
        article,
        { headers: { Authorization: token } }
      );

      // Update articles state
      setArticles(prevArticles =>
        prevArticles.map(a => a.article_id === article_id ? response.data.article : a)
      );
      setMessage(response.data.message);
    } catch (error) {
      console.log("There is an error while updating", error);
      const errorMessage = error.response?.data?.message || "Failed to update article. Please try again.";
      setMessage(errorMessage);
    } finally {
      setSpinnerOn(false);
      setCurrentArticleId(null); // Clear the current article ID after update
    }
  };




  const deleteArticle = async (article_id) => {
    try {
      // Make the DELETE request
      const response = await axios.delete(`${articlesUrl}/${article_id}`, {
        headers: { Authorization: token },
      });
      const successMessage = response.data.message;
      setArticles(prevArticles => prevArticles.filter(article => article.article_id !== article_id));
      setMessage(successMessage);
    } catch (error) {
      console.error("Error deleting article:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete article. Please try again.";
      setMessage(errorMessage);
    }
  };

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} redirectToLogin={redirectToLogin} redirectToArticles={redirectToArticles} logout={logout} />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                postArticle={postArticle}
                updateArticle={updateArticle}
                currentArticle={currentArticleId} // Pass the actual article object
                setCurrentArticle={setCurrentArticleId} // To reset the current article on cancel
              />

              <Articles
                articles={articles}
                getArticles={getArticles}
                deleteArticle={deleteArticle}
                updateArticle={updateArticle}
                setCurrentArticle={setCurrentArticleId} // Pass down setCurrentArticle for editing
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
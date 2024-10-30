import React, { useEffect, useState } from 'react';
import PT from 'prop-types';

const initialFormValues = { title: '', text: '', topic: '' };

export default function ArticleForm(props) {
  const [values, setValues] = useState(initialFormValues);
  const { postArticle, updateArticle, currentArticle, setCurrentArticle } = props;

  useEffect(() => {
    if (currentArticle) {
      setValues({
        title: currentArticle.title,
        text: currentArticle.text,
        topic: currentArticle.topic,
      });
    } else {
      setValues(initialFormValues); // Reset when no current article
    }
  }, [currentArticle]);

  const onChange = (evt) => {
    const { id, value } = evt.target;
    setValues({ ...values, [id]: value });
  };

  const onReset = () => {
    setValues(initialFormValues);
    setCurrentArticle(null); // Reset current article ID on cancel
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    const payload = {
      title: values.title,
      text: values.text,
      topic: values.topic,
    };
    if (currentArticle) {
      updateArticle(currentArticle.article_id, payload);
    } else {
      postArticle(payload);
    }
    onReset(); // Reset form and current article ID after submission
  };

  const isDisabled = () => {
    return values.title.length === 0 || values.text.length === 0 || values.topic.length === 0;
  };

  return (
    <form id="form" onSubmit={onSubmit}>
      <h2>{currentArticle ? "Edit Article" : "Create Article"}</h2>
      <input
        maxLength={50}
        onChange={onChange}
        value={values.title}
        placeholder="Enter title"
        id="title"
      />
      <textarea
        maxLength={200}
        onChange={onChange}
        value={values.text}
        placeholder="Enter text"
        id="text"
      />
      <select onChange={onChange} id="topic" value={values.topic}>
        <option value="">-- Select topic --</option>
        <option value="JavaScript">JavaScript</option>
        <option value="React">React</option>
        <option value="Node">Node</option>
      </select>
      <div className="button-group">
        <button disabled={isDisabled()} id="submitArticle">Submit</button>
        <button type="button" onClick={onReset}>Cancel</button>
      </div>
    </form>
  );
}

// 🔥 No touchy: ArticleForm expects the following props exactly:
ArticleForm.propTypes = {
  postArticle: PT.func.isRequired,
  updateArticle: PT.func.isRequired,
  setCurrentArticle: PT.func.isRequired, // Make sure this is also required
  currentArticle: PT.shape({ 
    article_id: PT.number.isRequired,
    title: PT.string.isRequired,
    text: PT.string.isRequired,
    topic: PT.string.isRequired,
  })
};

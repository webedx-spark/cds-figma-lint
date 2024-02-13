import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const aksAi = async (query: string) => {
  return new Promise<{ data: any }>((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: {
          choices: [
            {
              message: {
                content: `I'm sorry, I don't have an answer for that question. 😔`,
              },
            },
          ],
        },
      });
    }, 2000);
  });
};

export default function HelpPage() {
  const [query, setQuery] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);

  const [completion, setCompletion] = useState('');

  const sendQuery = (query) => {
    setQuery(query);
    setLoading(true);

    aksAi(query)
      .then((response) => {
        setLoading(false);
        setCompletion(response.data.choices[0].message.content);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    sendQuery(formData.get('query'));
    e.currentTarget.reset();
  };

  return (
    <div className="page-body">
      {!query && (
        <div className="examples">
          <h2 className="type--neg-medium-medium type--figma-black">
            Examples
          </h2>
          <ul className="list examples-list">
            <li className="list__item">
              <button
                className="button button--flex button--secondary example-button"
                onClick={() =>
                  sendQuery('Can I use Button to navigate between pages?')
                }
              >
                Can I use Button to navigate between pages?
              </button>
            </li>
            <li className="list__item">
              <button
                className="button button--flex button--secondary example-button"
                onClick={() =>
                  sendQuery(
                    'What is the difference between Select field ans Silent select field?'
                  )
                }
              >
                What is the difference between Select field ans Silent select
                field?
              </button>
            </li>
          </ul>
        </div>
      )}
      {query && (
        <div className="completion">
          <h2 className="type--neg-medium-medium type--figma-black completion__question">
            {query}
          </h2>
          <div className="completion__overflow">
            {loading ? (
              <div className="completion__loading type--neg-medium-normal">
                🧠 Thinking...
              </div>
            ) : (
              <div className="completion__answer type--neg-medium-normal">
                <ReactMarkdown linkTarget="_blank">{completion}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea--full-width"
            name="query"
            placeholder="Ask CDS AI Assistant a question..."
          ></textarea>
          <button className="button button--full" type="submit">
            Ask ✨
          </button>
        </form>
      </div>
    </div>
  );
}

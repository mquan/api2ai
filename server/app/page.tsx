"use client";

import { useState, useRef } from "react";
const URL = "/api/run";

const renderContent = (data) => {
  if (data.selectedOperation === "createImage") {
    const imageUrl = data.response.body.data[0].url;

    return (
      <div>
        <p>
          <strong>
            API used: {data.request.method.toUpperCase()} {data.request.url}
          </strong>
        </p>
        <a href={imageUrl} target="_blank">
          <img src={imageUrl} height={300} />
        </a>
      </div>
    );
  } else if (data.request && data.response) {
    return (
      <div>
        <p>
          <strong>
            API used: {data.request.method.toUpperCase()} {data.request.url}
          </strong>
        </p>
        <pre>
          <code>{JSON.stringify(data.response, null, "\t")}</code>
        </pre>
      </div>
    );
  } else {
    return (
      <div>
        <pre>
          <code>{JSON.stringify(data, null, "\t")}</code>
        </pre>
      </div>
    );
  }
};

export default function Page() {
  const [state, setState] = useState({
    messages: [
      { id: `${Date.now()}`, role: "AI", content: <div>How can I help?</div> },
    ],
    prompt: "",
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const postToAi = async ({ userPrompt, messageId }) => {
    const resp = await fetch(URL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ userPrompt }),
    });
    const data = await resp.json();

    stateRef.current.messages = stateRef.current.messages.map((message) => {
      if (message.id === messageId) {
        message.content = renderContent(data);
      }

      return message;
    });

    setState({
      prompt: stateRef.current.prompt,
      messages: stateRef.current.messages,
    });
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (!state.prompt?.length) {
      return;
    }

    const currentTime = Date.now();
    const userMessageId = `${currentTime}0`;
    const aiMessageId = `${currentTime}1`;

    postToAi({ userPrompt: state.prompt, messageId: aiMessageId });

    stateRef.current = {
      prompt: "",
      messages: [
        ...stateRef.current.messages,
        { id: userMessageId, role: "User", content: <div>{state.prompt}</div> },
        {
          id: aiMessageId,
          role: "AI",
          content: (
            <div>
              Processing your message{" "}
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              ></span>
            </div>
          ),
        },
      ],
    };
    setState(stateRef.current);
  };

  return (
    <div className="row py-lg-5">
      <h2>
        <a href="https://github.com/mquan/api2ai" target="_blank">
          api2ai
        </a>{" "}
        demo
      </h2>
      <div
        id="chat-log-container"
        className="mt-5 mb-5"
        style={{ height: 600, overflowY: "scroll" }}
      >
        <table id="chat-log" className="table table-borderless table-striped">
          <tbody id="chat-log-body">
            {state.messages.map((message) => {
              return (
                <tr key={message.id}>
                  <th>{message.role}</th>
                  <td>{message.content}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form id="chat-form" action="/api/run" method="post">
        <div className="row">
          <div className="col-8">
            <textarea
              value={state.prompt}
              className="form-control"
              id="chat-message"
              placeholder="Input message..."
              onChange={(e) => {
                stateRef.current.prompt = e.target.value;
                setState({
                  prompt: stateRef.current.prompt,
                  messages: stateRef.current.messages,
                });
              }}
            ></textarea>
          </div>
          <div className="col-2">
            <button
              type="submit"
              onClick={sendMessage}
              className="btn btn-primary mb-3"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

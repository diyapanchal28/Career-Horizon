import React from "react";

/**
 * Formats inline Markdown: **bold**, *italic*, `code`, [link](url)
 */
function renderInlineFormatting(text) {
  if (!text) return null;

  // Split tokens by formatting markers
  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex matching bold, inline code, links, and italic
  const inlineRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    const preText = text.substring(lastIndex, match.index);
    if (preText) {
      tokens.push(<span key={keyIdx++}>{preText}</span>);
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      tokens.push(
        <strong key={keyIdx++} className="font-semibold text-inherit">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      tokens.push(
        <code key={keyIdx++} className="chat-inline-code">
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith("[") && matchedStr.includes("](") && matchedStr.endsWith(")")) {
      const linkLabel = matchedStr.substring(1, matchedStr.indexOf("]("));
      const linkUrl = matchedStr.substring(matchedStr.indexOf("](") + 2, matchedStr.length - 1);
      tokens.push(
        <a
          key={keyIdx++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-link"
        >
          {linkLabel}
        </a>
      );
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      tokens.push(
        <em key={keyIdx++} className="italic">
          {matchedStr.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  const trailingText = text.substring(lastIndex);
  if (trailingText) {
    tokens.push(<span key={keyIdx++}>{trailingText}</span>);
  }

  return tokens.length > 0 ? tokens : text;
}

export default function ChatMessageContent({ content }) {
  if (!content) return null;

  // Detect AI configuration notice
  const isNotice = content.includes("AI Service Configuration Notice");

  const lines = content.split("\n");
  const blocks = [];
  let currentList = [];
  let listType = null; // 'ul' or 'ol'
  let blockKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === "ol") {
        blocks.push(
          <ol key={`list-${blockKey++}`} className="chat-ordered-list">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInlineFormatting(item)}</li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`list-${blockKey++}`} className="chat-bullet-list">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInlineFormatting(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Heading (e.g. ### or ##)
    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(
        <h4 key={`h4-${blockKey++}`} className="chat-heading-3">
          {renderInlineFormatting(trimmed.substring(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={`h3-${blockKey++}`} className="chat-heading-2">
          {renderInlineFormatting(trimmed.substring(3))}
        </h3>
      );
      continue;
    }

    // Bullet points (•, -, *)
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.substring(2);
      if (listType !== "ul") flushList();
      listType = "ul";
      currentList.push(itemText);
      continue;
    }

    // Numbered list items (e.g. "1. ", "2. ")
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (listType !== "ol") flushList();
      listType = "ol";
      currentList.push(itemText);
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={`p-${blockKey++}`} className="chat-paragraph">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList();

  return (
    <div className={`chat-message-content ${isNotice ? "chat-notice-card" : ""}`}>
      {blocks}
    </div>
  );
}

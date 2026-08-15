type FormattedTextProps = {
  text: string
  className?: string
}

/**
 * Render admin textarea content: blank lines become paragraphs, single returns stay as line breaks.
 */
export function FormattedText({ text, className = 'text-gray-600' }: FormattedTextProps) {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

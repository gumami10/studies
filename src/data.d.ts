declare module '*.js' {
  const data: {
    chapters: Array<{
      id: string
      meta: { type: string; badges: Array<{ text: string }> }
      title: string
      content: unknown[]
    }>
    toc: Array<{ id: string; label: string; status: string }>
    footerText: string
  }
  export default data
}

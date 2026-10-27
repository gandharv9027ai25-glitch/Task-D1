function FeaturedArticles() {
  const articles = [
    {
      title: "Getting Started with Artificial Intelligence",
      description:
        "An introduction to artificial intelligence and how it is used in modern technology."
    },
    {
      title: "Learning Web Development",
      description:
        "Useful information about learning HTML, CSS, JavaScript and React for frontend development."
    },
    {
      title: "Why Data Science is Important",
      description:
        "Data science helps organisations understand data and make better decisions."
    }
  ]

  return (
    <section id="articles">
      <h2>Featured Articles</h2>

      <div className="articles">
        {articles.map((article, index) => (
          <div className="article" key={index}>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedArticles
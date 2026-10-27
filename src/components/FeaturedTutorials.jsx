function FeaturedTutorials() {
  const tutorials = [
    {
      title: "Exploring the Mountains",
      description:
        "Mountains are a great place to enjoy nature, explore beautiful landscapes and experience outdoor adventures."
    },
    {
      title: "My Interest in Cars",
      description:
        "Cars are one of my interests, and I enjoy learning about different cars, their designs and technology."
    },
    {
      title: "Exploring Australia",
      description:
        "Australia is a beautiful country with diverse landscapes, modern cities and many interesting places to explore."
    }
  ]

  return (
    <section id="tutorials">
      <h2>My Interests & Stories</h2>

      <div className="tutorials">
        {tutorials.map((tutorial, index) => (
          <div className="tutorial" key={index}>
            <h3>{tutorial.title}</h3>
            <p>{tutorial.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedTutorials
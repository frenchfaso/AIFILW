# Algorithms I fell in love with

This is an attempt to write an interactive book about algorithms, the ones that sparked my imagination as a teenager and during my long journey through computers and the many "windows" they open in curious minds.  
It's an open-ended endeavor, much like computer science and perhaps any journey in general. I will add interesting and stimulating algorithms along the way, trying to make their acquaintance and hopefully present them here in a simple yet engaging manner.

## Writing a chapter

The site is generated with [Hugo](https://gohugo.io/) and does not use an external theme or a package manager.

Create a Markdown file in `content/chapters`, using the next available number:

```markdown
---
title: My chapter
weight: 40
---

Write the chapter here.
```

The `weight` controls the chapter order. To embed a p5.js sketch:

```markdown
{{< p5 id="SKETCH_ID" title="Sketch description" >}}
```

Preview the site locally with:

```sh
hugo server
```

Every push is built by GitHub Actions. Pushes to `main` are also deployed to GitHub Pages once Pages is configured to use GitHub Actions as its source.

## License(s)

All the code is licensed under the MIT license.  
The book is licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)  

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Algorithms I fell in love with</span> by <span xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">Francesco Scarselli</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

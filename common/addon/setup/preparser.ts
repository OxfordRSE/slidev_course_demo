import { definePreparserSetup } from '@slidev/types'

export default definePreparserSetup(() => [{
  transformSlide(content, frontmatter) {
    if (frontmatter['training-event-only'] && !process.env.TRAINING_EVENT)
      frontmatter.disabled = true
  },
}])

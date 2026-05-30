<template>
  <footer>
    <div v-if="$slots.default" class="footer-page-text">
      <slot />
    </div>
    <div class="footer-sources">
      <p>
        Content based on
        <a href="https://www.istqb.org/certifications" target="_blank" rel="noopener noreferrer"
          >ISTQB<sup>&reg;</sup> Certified Tester</a
        >
        syllabi:
      </p>
      <ul>
        <li>
          <a
            href="https://www.istqb.org/certifications/agile-tester"
            target="_blank"
            rel="noopener noreferrer"
            >CTAL-AT v2.0</a
          >
          — Advanced Level Agile Tester
        </li>
        <li>
          <a
            href="https://www.istqb.org/certifications/test-automation-engineer"
            target="_blank"
            rel="noopener noreferrer"
            >CTAL-TAE v2.0</a
          >
          — Test Automation Engineering
        </li>
        <li>
          <a
            href="https://www.istqb.org/certifications/test-analyst"
            target="_blank"
            rel="noopener noreferrer"
            >CTAL-TA v4.0</a
          >
          — Test Analyst
        </li>
      </ul>
    </div>
    <p class="footer-disclaimer">
      This is an <strong>unofficial</strong> study guide. ISTQB<sup>&reg;</sup> is a registered
      trademark of the International Software Testing Qualifications Board. All syllabus content
      remains the intellectual property of ISTQB<sup>&reg;</sup>. This project is not affiliated
      with, endorsed by, or sponsored by ISTQB<sup>&reg;</sup>.
    </p>
  </footer>
</template>

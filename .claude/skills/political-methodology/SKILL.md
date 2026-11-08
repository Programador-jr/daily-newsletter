---
name: political-methodology
description: Scientific and methodological guidance for auditing, developing, validating, and maintaining the King's Newsletter 12 Axes political ideology assessment.
---

# King's Newsletter — Political Methodology

## 1. Purpose

This skill establishes the scientific, methodological, and technical standards for developing and maintaining the King's Newsletter political assessment.

The objective is to make the assessment as theoretically coherent, politically neutral, transparent, and empirically defensible as possible.

The assessment is an educational and exploratory instrument. It must not be described as scientifically validated until appropriate empirical validation has been conducted.

## 2. Core principles

Every task involving the assessment must follow these principles:

- **Scientific grounding:** Prefer peer-reviewed research, established academic literature, validated survey instruments, and reputable research institutions.
- **Political neutrality:** Do not favor political parties, ideologies, governments, personalities, or political movements.
- **Conceptual precision:** Each dimension must measure a clearly defined political construct.
- **Measurement integrity:** Do not force unrelated concepts into artificial oppositions.
- **Transparency:** Document methodological decisions, assumptions, limitations, and editorial judgments.
- **Reproducibility:** Scoring methods and classification criteria must be documented and testable.
- **Contextual accuracy:** Consider Brazilian political, institutional, historical, and socioeconomic realities without ignoring international perspectives.

## 3. Scientific foundations

Use relevant academic and institutional references, including:

- World Values Survey (WVS).
- European Values Study (EVS).
- Pew Research Center political typology and survey methodology.
- Chapel Hill Expert Survey (CHES), when applicable to party positioning.
- Peer-reviewed political science and psychometrics research.
- Brazilian academic research on ideology, parties, political behavior, and institutions.

Never invent references, authors, findings, or validation results.

When citing research, identify the author, publication, year, DOI or official URL when available, and explain how the research supports the methodological decision.

## 4. Assessment dimensions

The assessment currently contains 12 political dimensions:

1. Federalism and territorial organization.
2. Democracy and political representation.
3. Security, civil liberties, and state authority.
4. Immigration and cultural integration.
5. Diplomacy, military policy, and pacifism.
6. National sovereignty and international intervention.
7. Public and private economic participation.
8. Economic planning and market coordination.
9. Protectionism and international trade.
10. Religion, secularism, and public institutions.
11. Social values and cultural change.
12. Technology, biological systems, and human development.

These are existing assessment categories, not automatically validated scientific dimensions.

Before changing any dimension:

- Define the construct being measured.
- Identify its theoretical foundations.
- Determine whether its proposed poles are genuinely opposite.
- Identify potentially independent subdimensions.
- Consider whether the dimension requires reformulation or separation.
- Document the reasoning and supporting references.

### Important conceptual warnings

Do not assume that:

- Security and freedom are necessarily opposites.
- Nationalism and non-interventionism are interchangeable.
- Military defense and support for war represent the same position.
- Personal religiosity determines one's position on state secularism.
- Technology and biological preservation are mutually exclusive.
- Support for immigration controls necessarily implies cultural assimilation.
- Public economic participation and economic planning represent the same construct.

Where concepts are independent, do not force them into a single bipolar score without theoretical justification.

## 5. Question development and auditing

Every question must measure a specific construct.

Audit questions for:

- Ambiguous language.
- Double-barreled statements.
- Leading or politically loaded wording.
- Emotional manipulation.
- Social desirability bias.
- Unnecessary negations.
- Unclear reference periods or contexts.
- Assumptions that respondents share a particular political vocabulary.
- Statements that combine different political positions.

Each question should have:

1. A unique identifier.
2. Its associated dimension.
3. The construct it measures.
4. Its intended scoring direction.
5. Its theoretical justification.
6. A neutrality assessment.
7. Identified methodological problems.
8. A proposed revision, when necessary.

Questions must allow respondents to express complex or mixed positions.

Do not rewrite questions merely to make them sound more academic. Clarity and measurement quality take priority over sophisticated vocabulary.

### Response scales

Review response alternatives for balance, clarity, and consistency.

Consider acquiescence bias when using agreement/disagreement scales. Use balanced statements and avoid excessive reverse-worded questions.

Do not introduce reverse scoring without documenting and testing its effects.

## 6. Scoring methodology

Every scoring formula must have an explicit theoretical and mathematical justification.

Do not present arbitrary weights as scientifically established.

For every scoring component, document:

- What it measures.
- Why it is included.
- Its mathematical formula.
- Its relative influence.
- Its limitations.
- How it behaves under extreme, neutral, and mixed responses.

Archetype questions must not distort the primary ideological score without empirical evidence supporting their inclusion.

Separate the following concepts:

- Position on a political dimension.
- Intensity of a position.
- Relative importance of an issue.
- Similarity between respondents.
- Compatibility with political profiles.

Do not treat these measurements as interchangeable.

Percentages of ideological compatibility must be presented as algorithmic estimates, not validated probabilities or objective scientific truths.

## 7. Political catalog and profile classification

The catalog may contain:

- Political ideologies.
- Political parties.
- Public figures.
- Countries.
- Political regimes.
- Historical movements.
- Political values and archetypes.

Every classification must distinguish:

1. Documented historical or institutional facts.
2. Academic interpretations.
3. Editorial classifications.
4. Algorithmic approximations.

For each profile, document:

- Source references.
- Reference date.
- Geographic and historical context.
- Classification criteria.
- Dimension scores.
- Confidence or uncertainty where appropriate.

Do not assign political positions based solely on reputation, party labels, isolated statements, or personal assumptions.

For contemporary political parties and public figures, prefer multiple independent and recent sources.

Do not fabricate precision where reliable evidence is insufficient.

## 8. Empirical validation

Before describing the assessment as scientifically validated, consider the following stages:

### Content validity

Evaluate whether the questions adequately represent the intended constructs, preferably with independent subject-matter experts.

### Cognitive testing

Conduct interviews or comprehension tests to determine whether respondents interpret questions as intended.

### Pilot testing

Apply the assessment to real participants and investigate response patterns, missing answers, and usability issues.

### Reliability

Evaluate internal consistency where appropriate and temporal stability through test-retest methods.

Do not rely on Cronbach's alpha as proof of validity or apply it indiscriminately to multidimensional instruments.

### Structural validity

Use exploratory and confirmatory factor analysis when the sample size and measurement assumptions support these methods.

### Bias and fairness

Investigate acquiescence, social desirability, response styles, demographic differences, and possible measurement non-invariance.

### External validity

Compare results with theoretically relevant external measures, without assuming that any single political scale is an absolute reference.

Until adequate evidence exists, describe the assessment as exploratory and educational.

## 9. Technical development standards

When modifying the repository:

- Inspect the existing implementation before proposing changes.
- Preserve existing features unless removal is explicitly justified and approved.
- Avoid unnecessary architectural rewrites.
- Maintain compatibility between questions, dimensions, scoring, and catalog data.
- Validate identifiers, schemas, and references.
- Check that every question maps to a valid dimension.
- Test short, complete, and extreme assessment modes.
- Test missing answers, neutral responses, extreme responses, and mixed ideological profiles.
- Check the result calculations and catalog rankings for regressions.
- Run the available test suite before proposing a merge.

Never claim that tests passed without actually executing them.

### Change management

Before implementing changes, explain:

1. What will change.
2. Which files and components will be affected.
3. Why the change is necessary.
4. Expected behavior before and after.
5. Potential side effects and compatibility risks.
6. How the change will be tested.

Protect uncommitted user changes. Never overwrite or discard them without explicit authorization.

Do not merge pull requests or modify the main branch without explicit authorization.

Use professional English for commit messages and pull request descriptions.

## 10. Research and documentation workflow

For substantial methodological changes:

1. Inspect the current implementation.
2. Identify the methodological problem.
3. Search for relevant academic evidence.
4. Compare alternative solutions.
5. Present the proposed change and its implications.
6. Wait for approval before implementation.
7. Implement incrementally.
8. Run tests and document results.
9. Update the methodological documentation.

Maintain a record of important methodological decisions, including rejected alternatives and their reasons.

## 11. Prohibited practices

Never:

- Claim scientific validation without empirical evidence.
- Invent academic references or research results.
- Change scoring weights arbitrarily.
- Force unrelated constructs into artificial political oppositions.
- Introduce partisan bias into questions or classifications.
- Treat political neutrality as the absence of documented criticism.
- Present editorial classifications as objective facts.
- Modify user work without authorization.
- Remove existing functionality without explaining the consequences.
- Hide methodological limitations from respondents.

## 12. Final objective

The King's Newsletter assessment should become a transparent, methodologically defensible, multidimensional educational instrument.

Its credibility must come from conceptual precision, balanced questions, documented evidence, reproducible calculations, and empirical validation — not from the number of questions, complexity of the algorithm, or appearance of scientific authority.

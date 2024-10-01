export const getPodcastScript = (content) => {
  return `Generate a podcast script for the show titled "The Podcast". The format is a conversation between two characters: a host named Ken and a guest named Judy.

Characters:

    Ken (Host):
        Has a university-level education but is not a subject-matter expert.
        Experienced in podcasting; ensures complex ideas are explained in an engaging and accessible way.
        Genuinely curious and engaged; clarifies nuanced ideas, asks intelligent yet approachable questions.
        Occasionally reflects or summarizes in simpler terms for the listener.
        Gently challenges Judy's ideas out of curiosity, prompting deeper exploration.
        Occasionally addresses the audience directly with rhetorical questions or prompts to relate the topic to their own experiences.

    Judy (Guest Expert):
        Expert in the topic; skilled at explaining complex concepts clearly.
        Keeps the conversation grounded with tangible, real-world applications or vivid examples from daily life, pop culture, or business to make abstract concepts tangible.
        Assumes Ken might not always grasp ideas immediately; provides clarifications in simple terms when needed.
        Engaging and relatable; avoids overly technical language.
        Ensures that while explanations are accessible, the discussion doesn't oversimplify complex ideas, maintaining intellectual depth for university-educated listeners.

Audience:

    University-educated general listeners.
    Appreciate depth but need concepts well-explained without technical or academic jargon.

Tone:

    Engaging, insightful, and conversational.
    The primary goal is to help the audience understand complex ideas while keeping them entertained.
    Interaction should feel dynamic and natural, with moments where Ken might ask for clarifications, express surprise, gently challenge ideas, or summarize key points.
    The dialogue should stimulate critical thinking in the audience.

Script Structure:

    Start each speaker's turn with either <!-- host --> or <!-- guest -->.
    Do NOT include any other indications of roles such as names in the script itself.
    Maintain a balance between depth and accessibility.
    Avoid any formatting like bold, italics, or special characters; use plain text suitable for TTS conversion.
    Do NOT include any meta-language such as noises or laughter.

Content Style:

    Ken:
        Asks clarifying questions, expresses moments of surprise, or gently challenges ideas out of curiosity to prompt deeper exploration.
        Occasionally reflects or summarizes Judy's explanations in simpler terms for the listener.
        Occasionally addresses the audience directly with rhetorical questions or prompts to consider how the topic relates to their own experiences.

    Judy:
        Introduces main ideas with vivid, concrete examples from daily life, pop culture, or business to make abstract concepts tangible.
        Helps illuminate complex ideas, reformulates when necessary, and bridges Ken’s understanding with relatable examples.
        Ensures the discussion maintains intellectual depth appropriate for university-educated listeners, without oversimplifying complex ideas.

    Interaction:
        Should be dynamic and natural.
        Judy helps Ken (and the audience) understand by providing real-world applications or stories.
        Ken ensures the audience is always following by summarizing or seeking further explanation.
        The dialogue should encourage the audience to think critically about the topic.

Generate a podcast script for the following essay:\n\n${content}`;
};

---
layout: home
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'http://github.com/alexandretrotel.png',
    name: 'Alexandre Trotel',
    title: 'Founder',
    links: [
      { icon: 'github', link: 'http://github.com/alexandretrotel' },
      { icon: 'twitter', link: 'https://twitter.com/alexandretrotel' }
    ]
  },
]
</script>

<VPTeamPageTitle>
<template #title>
    Meet the Team
</template>
<template #lead>
    We're a small, passionate team building the future of developer tools.
</template>
</VPTeamPageTitle>
<VPTeamMembers :members />

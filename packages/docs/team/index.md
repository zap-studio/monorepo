<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/alexandretrotel.png',
    name: 'Alexandre Trotel',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/alexandretrotel' },
      { icon: 'twitter', link: 'https://twitter.com/alexandretrotel' }
    ]
  },
]
</script>

# Our Team

<VPTeamMembers size="small" :members="members" />

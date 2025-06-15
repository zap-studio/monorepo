<script setup>
import { VPTeamMembers } from "vitepress/theme";

const members = [
	{
		avatar: "https://www.github.com/alexandretrotel.png",
		name: "Alexandre Trotel",
		title: "Founder",
		links: [
			{ icon: "github", link: "https://github.com/alexandretrotel" },
			{ icon: "twitter", link: "https://twitter.com/alexandretrotel" },
		],
	},
	{
		avatar: "https://www.github.com/wfelipe99.png",
		name: "Wevelly Felipe",
		title: "Contributor",
		links: [{ icon: "github", link: "https://github.com/wfelipe99" }],
	},
];
</script>

# Contributors

<VPTeamMembers size="small" :members="members" />

<script setup>
import { VPTeamMembers } from "vitepress/theme";

const members = [
	{
		avatar: "https://www.github.com/alexandretrotel.png",
		name: "Alexandre Trotel",
		title: "Author",
		links: [
			{ icon: "github", link: "https://github.com/alexandretrotel" },
			{ icon: "x", link: "https://x.com/alexandretrotel" },
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

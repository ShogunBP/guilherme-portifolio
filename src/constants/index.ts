export interface Skill {
  skill_name: string
  Image: string
  width: number
  height: number
}

export const skills: Skill[] = [
  { skill_name: 'JavaScript', Image: '/js.png', width: 65, height: 65 },
  { skill_name: 'TypeScript', Image: '/ts.png', width: 80, height: 80 },
  { skill_name: 'Vue.js', Image: '/vue.png', width: 80, height: 80 },
  { skill_name: 'Vite', Image: '/vite.png', width: 80, height: 80 },
  { skill_name: 'BootstrapVue', Image: '/bootstrapvue.png', width: 80, height: 80 },
  { skill_name: 'Chart.js', Image: '/chartjs.png', width: 80, height: 80 },
  { skill_name: '.NET', Image: '/dotnet.png', width: 80, height: 80 },
  { skill_name: 'ASP.NET', Image: '/aspnet.png', width: 80, height: 80 },
  { skill_name: 'Node.js', Image: '/node-js.png', width: 80, height: 80 },
  { skill_name: 'MySQL', Image: '/mysql.png', width: 70, height: 70 },
  { skill_name: 'SQL Server', Image: '/sqlserver.png', width: 70, height: 70 },
  { skill_name: 'Docker', Image: '/docker.webp', width: 70, height: 70 },
  { skill_name: 'Azure DevOps', Image: '/azuredevops.png', width: 80, height: 80 },
  { skill_name: 'GitHub', Image: '/github.png', width: 80, height: 80 },
]

export const Socials = [
  {
    name: 'Discord',
    src: '/instagram.svg',
    link: '',
  },
  {
    name: 'Facebook',
    src: '/facebook.svg',
    link: '',
  },
  {
    name: 'Instagram',
    src: '/discord.svg',
    link: '',
  },
]

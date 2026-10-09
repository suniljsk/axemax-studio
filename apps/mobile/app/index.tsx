import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

const API = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080'
type Project = { id?: number; title: string; slug: string; summary: string; technologies: string; githubUrl?: string; demoUrl?: string }
const sample: Project[] = [
  {title:'AxeMax API Monitor',slug:'axemax-api-monitor',summary:'A real-time view into API health, latency, and reliability.',technologies:'Java, Spring Boot, React'},
  {title:'Personal Finance Hub',slug:'personal-finance-hub',summary:'A data-first dashboard for spending, savings, and investment goals.',technologies:'TypeScript, React, PostgreSQL'},
  {title:'Commerce Engine',slug:'commerce-engine',summary:'A modular foundation for catalog, cart, orders, and inventory.',technologies:'Java, REST API, Docker'}
]
export default function HomeScreen() {
  const [projects,setProjects] = useState<Project[]>(sample)
  const [loading,setLoading] = useState(true)
  const [apiLive,setApiLive] = useState(false)
  useEffect(() => {
    fetch(`${API}/api/v1/projects?page=0&size=20`).then(r=>{if(!r.ok)throw new Error();return r.json()})
      .then(data=>{setProjects(data.content ?? []);setApiLive(true)}).catch(()=>setApiLive(false)).finally(()=>setLoading(false))
  },[])
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}><View style={s.logo}><Text style={s.logoText}>A<Text style={{color:'#9c8bff'}}>M</Text></Text></View><View><Text style={s.brand}>AXEMAX</Text><Text style={s.subbrand}>STUDIO</Text></View><View style={s.pill}><View style={s.dot}/><Text style={s.pillText}>{apiLive?'API LIVE':'PORTFOLIO'}</Text></View></View>
      <View style={s.hero}><Text style={s.kicker}>INDEPENDENT IDEAS · THOUGHTFUL ENGINEERING</Text><Text style={s.title}>Build beyond{"\n"}<Text style={s.gradient}>the expected.</Text></Text><Text style={s.copy}>A digital studio for useful ideas, carefully engineered products, and experiences that make complex things feel simple.</Text><Pressable style={s.button} onPress={()=>{}}><Text style={s.buttonText}>SELECTED WORK ↓</Text></Pressable></View>
      <View style={s.sectionHead}><Text style={s.kicker}>SELECTED BUILDS</Text><Text style={s.sectionTitle}>Work with purpose.</Text></View>
      {loading?<ActivityIndicator color="#a99aff" style={{margin:30}}/>:null}
      <FlatList data={projects} scrollEnabled={false} keyExtractor={(p)=>String(p.id ?? p.slug)} renderItem={({item,index})=><View style={s.card}><View style={[s.art,{backgroundColor:['#1b1b35','#142a40','#24203a'][index%3]}]}><Text style={s.artIndex}>AXM / {String(index+1).padStart(2,'0')}</Text><Text style={s.artGlyph}>{['◈','◎','⌘'][index%3]}</Text></View><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardCopy}>{item.summary}</Text><View style={s.tags}>{item.technologies.split(',').map(t=><Text key={t} style={s.tag}>{t.trim()}</Text>)}</View><View style={s.linkRow}>{item.githubUrl?<Text style={s.link} onPress={()=>Linking.openURL(item.githubUrl!)}>SOURCE ↗</Text>:null}{item.demoUrl?<Text style={s.link} onPress={()=>Linking.openURL(item.demoUrl!)}>LIVE DEMO ↗</Text>:null}</View></View>} />
      <View style={s.skills}><Text style={s.kicker}>TOOLS OF THE TRADE</Text><Text style={s.sectionTitle}>Built with intention.</Text>{['Java · Spring Boot · REST APIs','React · TypeScript · Responsive UI','React Native · Expo · API integration','Git · Docker · CI/CD · Playwright'].map(x=><View style={s.skill} key={x}><Text style={s.skillText}>{x}</Text><Text style={s.skillArrow}>↗</Text></View>)}</View>
      <View style={s.contact}><Text style={s.kicker}>OPEN TO BUILDING</Text><Text style={s.contactTitle}>Let’s make it real.</Text><Text style={s.copy}>Questions, collaboration, or a project worth exploring—start a conversation.</Text><Pressable style={s.button} onPress={()=>Linking.openURL('mailto:axemax.hq@gmail.com')}><Text style={s.buttonText}>axemax.hq@gmail.com ↗</Text></Pressable></View>
      <Text style={s.footer}>© {new Date().getFullYear()} AXEMAX STUDIO · BUILT WITH INTENTION</Text>
    </ScrollView>
  </SafeAreaView>
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#090b12'},container:{padding:20,paddingBottom:40},header:{flexDirection:'row',alignItems:'center',gap:10,paddingBottom:22,borderBottomWidth:1,borderBottomColor:'#ffffff16'},
 logo:{width:39,height:39,borderRadius:10,borderWidth:1,borderColor:'#9c8bff99',alignItems:'center',justifyContent:'center'},logoText:{color:'#fff',fontSize:19,fontWeight:'900'},brand:{color:'#f1f2f7',fontSize:12,fontWeight:'900',letterSpacing:2},subbrand:{color:'#8f95a9',fontSize:8,letterSpacing:4,marginTop:3},pill:{marginLeft:'auto',flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:'#ffffff19',paddingVertical:7,paddingHorizontal:9,borderRadius:20},dot:{width:6,height:6,borderRadius:4,backgroundColor:'#78e1b1'},pillText:{fontSize:8,color:'#aeb3c4',letterSpacing:1},
 hero:{paddingTop:53,paddingBottom:45},kicker:{fontSize:9,color:'#aaa4ff',letterSpacing:1.2,lineHeight:17},title:{fontSize:47,lineHeight:52,color:'#f4f3ff',fontWeight:'800',letterSpacing:-2,marginTop:21},gradient:{color:'#a99aff'},copy:{fontSize:13,lineHeight:22,color:'#a1a7ba',marginTop:18},button:{alignSelf:'flex-start',marginTop:23,backgroundColor:'#eae8ff',paddingHorizontal:15,paddingVertical:13,borderRadius:7},buttonText:{fontSize:10,fontWeight:'900',color:'#10111a',letterSpacing:.6},
 sectionHead:{marginBottom:20,borderTopWidth:1,borderTopColor:'#ffffff16',paddingTop:28},sectionTitle:{fontSize:29,fontWeight:'800',letterSpacing:-1,color:'#f1f2f7',marginTop:8},card:{borderWidth:1,borderColor:'#ffffff16',backgroundColor:'#11141f',borderRadius:10,padding:14,marginBottom:15},art:{height:150,borderRadius:7,alignItems:'center',justifyContent:'center',marginBottom:17,overflow:'hidden'},artIndex:{position:'absolute',top:12,left:12,fontSize:8,color:'#aaa4ff',letterSpacing:1.5},artGlyph:{fontSize:74,color:'#a99aff'},cardTitle:{fontSize:17,fontWeight:'800',color:'#f1f2f7'},cardCopy:{fontSize:11,color:'#979db0',lineHeight:19,marginTop:7},tags:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:13},tag:{fontSize:9,color:'#b8bdd0',borderColor:'#ffffff19',borderWidth:1,borderRadius:4,paddingVertical:5,paddingHorizontal:7},linkRow:{flexDirection:'row',gap:18,marginTop:17,paddingTop:13,borderTopWidth:1,borderTopColor:'#ffffff12'},link:{fontSize:9,color:'#c1baff',letterSpacing:.8},
 skills:{paddingVertical:36},skill:{borderTopWidth:1,borderTopColor:'#ffffff16',paddingVertical:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},skillText:{fontSize:11,color:'#aeb4c8'},skillArrow:{color:'#a99aff'},contact:{borderWidth:1,borderColor:'#aaa0ff40',borderRadius:12,padding:22,backgroundColor:'#141626',marginTop:10},contactTitle:{fontSize:32,fontWeight:'800',color:'#f1f2f7',marginTop:12,letterSpacing:-1},footer:{textAlign:'center',color:'#687088',fontSize:8,letterSpacing:1.1,marginTop:28,lineHeight:16}
})

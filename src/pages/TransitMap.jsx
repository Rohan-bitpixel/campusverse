import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Maximize2, 
  Minimize2, 
  FileText, 
  Map as MapIcon, 
  CreditCard, 
  Navigation, 
  Bus, 
  Download,
  ExternalLink
} from 'lucide-react';
import './TransitMap.css';

const STATIONS = [
  { sequence: 1, name: "Raipur Railway Station", coords: [21.252977, 81.629469], type: "terminal" },
  { sequence: 2, name: "DKS Bhawan", coords: [21.243987, 81.639774], type: "regular" },
  { sequence: 3, name: "Telibandha", coords: [21.239015, 81.670926], type: "regular" },
  { sequence: 4, name: "Agriculture College", coords: [21.236747, 81.716904], type: "regular" },
  { sequence: 5, name: "Sector 15", coords: [21.186017, 81.775907], type: "regular" },
  { sequence: 6, name: "CBD", coords: [21.171006, 81.774416], type: "regular" },
  { sequence: 7, name: "Ekatm Path", coords: [21.163482, 81.78081], type: "regular" },
  { sequence: 8, name: "North Block", coords: [21.166964, 81.788428], type: "regular" },
  { sequence: 9, name: "Mahanadi Bhawan", coords: [21.160081, 81.799221], type: "regular" },
  { sequence: 10, name: "Indravati Bhawan", coords: [21.155938, 81.797912], type: "regular" },
  { sequence: 11, name: "South Block", coords: [21.155488, 81.78448], type: "regular" },
  { sequence: 12, name: "Sector 27", coords: [21.143641, 81.782087], type: "regular" },
  { sequence: 13, name: "Sector 29", coords: [21.135385, 81.779062], type: "regular" },
  { sequence: 14, name: "Sector 30", coords: [21.127334, 81.788465], type: "regular" },
  { sequence: 15, name: "Balco Medical", coords: [21.123111, 81.775478], type: "regular" },
  { sequence: 16, name: "HNLU", coords: [21.121945, 81.768724], type: "terminal" }
];

const SNAPPED_ROUTE = [
  [21.25298, 81.62947],[21.252969, 81.629499],[21.251916, 81.629057],[21.251803, 81.628982],
  [21.251779, 81.628984],[21.251767, 81.628982],[21.250974, 81.629629],[21.250509, 81.630008],
  [21.250174, 81.630283],[21.24998, 81.630443],[21.249913, 81.630451],[21.249805, 81.630551],
  [21.249623, 81.630685],[21.24938, 81.630891],[21.249345, 81.630913],[21.249263, 81.630964],
  [21.249268, 81.631165],[21.249285, 81.631546],[21.249283, 81.6319],[21.24929, 81.632082],
  [21.249303, 81.632243],[21.249328, 81.632294],[21.249275, 81.632501],[21.24923, 81.632646],
  [21.249228, 81.63268],[21.248938, 81.63274],[21.248708, 81.632796],[21.248477, 81.632844],
  [21.248196, 81.632898],[21.248076, 81.632927],[21.247801, 81.632994],[21.247587, 81.633037],
  [21.247345, 81.633086],[21.247051, 81.63315],[21.246892, 81.633185],[21.246807, 81.633202],
  [21.24655, 81.633256],[21.246215, 81.633335],[21.246052, 81.633373],[21.245858, 81.633411],
  [21.245507, 81.633498],[21.245314, 81.633576],[21.24518, 81.63363],[21.244788, 81.633747],
  [21.244393, 81.63386],[21.244305, 81.633908],[21.243948, 81.634054],[21.243689, 81.634159],
  [21.243335, 81.634354],[21.243311, 81.634403],[21.243313, 81.634489],[21.243335, 81.634645],
  [21.24351, 81.63509],[21.243624, 81.635379],[21.243648, 81.635438],[21.243663, 81.635462],
  [21.243682, 81.635489],[21.243711, 81.635496],[21.243738, 81.635513],[21.243758, 81.635538],
  [21.24377, 81.635568],[21.243772, 81.635601],[21.243765, 81.635633],[21.243749, 81.63566],
  [21.243764, 81.635705],[21.243806, 81.635834],[21.243969, 81.636241],[21.244122, 81.636621],
  [21.244231, 81.636892],[21.244516, 81.6376],[21.24493, 81.638663],[21.245252, 81.639518],
  [21.245166, 81.639541],[21.244777, 81.639602],[21.244335, 81.639667],[21.244044, 81.639736],
  [21.243983, 81.639762],[21.243812, 81.639834],[21.243576, 81.639971],[21.243812, 81.639834],
  [21.244044, 81.639736],[21.244335, 81.639667],[21.244777, 81.639602],[21.245166, 81.639541],
  [21.245252, 81.639518],[21.245432, 81.64004],[21.24552, 81.640491],[21.245547, 81.640828],
  [21.245568, 81.641382],[21.245548, 81.641552],[21.245541, 81.641589],[21.245524, 81.641627],
  [21.245496, 81.6417],[21.245475, 81.641745],[21.245409, 81.641884],[21.245376, 81.641952],
  [21.245354, 81.64202],[21.245302, 81.642138],[21.245259, 81.642254],[21.244922, 81.64367],
  [21.244914, 81.643705],[21.244892, 81.643795],[21.244869, 81.643894],[21.244774, 81.644303],
  [21.244416, 81.645846],[21.244224, 81.646653],[21.244199, 81.646745],[21.24392, 81.647793],
  [21.24367, 81.648722],[21.243585, 81.649068],[21.243251, 81.650504],[21.242898, 81.65204],
  [21.242564, 81.653615],[21.24235, 81.654612],[21.242262, 81.654992],[21.242191, 81.655297],
  [21.242148, 81.655498],[21.241707, 81.657574],[21.24154, 81.658359],[21.241513, 81.658513],
  [21.241419, 81.658959],[21.241232, 81.659848],[21.241118, 81.660283],[21.240956, 81.660684],
  [21.240712, 81.6611],[21.240447, 81.661487],[21.239864, 81.6623],[21.239684, 81.662729],
  [21.239667, 81.662805],[21.239615, 81.66313],[21.23954, 81.663628],[21.239562, 81.664016],
  [21.239664, 81.664957],[21.239591, 81.665626],[21.239526, 81.666229],[21.239387, 81.667195],
  [21.239367, 81.667334],[21.239279, 81.667945],[21.239239, 81.668228],[21.239182, 81.668671],
  [21.239144, 81.668968],[21.239127, 81.669105],[21.239069, 81.669577],[21.238979, 81.670311],
  [21.238906, 81.670911],[21.238885, 81.671081],[21.238816, 81.671647],[21.238784, 81.671744],
  [21.23876, 81.671806],[21.238725, 81.671892],[21.23867, 81.672169],[21.238591, 81.672559],
  [21.238666, 81.672773],[21.238702, 81.672895],[21.238754, 81.673117],[21.238819, 81.673641],
  [21.23892, 81.675232],[21.239046, 81.676846],[21.239098, 81.677483],[21.239107, 81.677591],
  [21.239111, 81.677641],[21.239147, 81.678064],[21.239216, 81.679025],[21.239244, 81.679406],
  [21.239249, 81.679476],[21.239255, 81.679566],[21.23926, 81.679631],[21.239265, 81.6797],
  [21.239331, 81.680981],[21.239352, 81.681725],[21.239322, 81.682171],[21.23923, 81.682817],
  [21.239155, 81.683198],[21.239035, 81.683648],[21.238986, 81.683828],[21.238805, 81.684364],
  [21.238513, 81.684977],[21.238132, 81.685763],[21.23991, 81.686071],[21.237879, 81.686389],
  [21.237771, 81.686796],[21.237689, 81.687418],[21.237667, 81.687859],[21.237656, 81.688583],
  [21.237611, 81.689067],[21.237559, 81.689368],[21.237458, 81.689835],[21.237315, 81.690358],
  [21.23715, 81.691047],[21.237064, 81.691484],[21.237, 81.691822],[21.236949, 81.692227],
  [21.23693, 81.692719],[21.236937, 81.693102],[21.236958, 81.693567],[21.237005, 81.694129],
  [21.237077, 81.694936],[21.237097, 81.695168],[21.237146, 81.695634],[21.237249, 81.696703],
  [21.23731, 81.697325],[21.237442, 81.698386],[21.237512, 81.698961],[21.237608, 81.699648],
  [21.237671, 81.700182],[21.237689, 81.700332],[21.237762, 81.701133],[21.237818, 81.701961],
  [21.237895, 81.702691],[21.237901, 81.702763],[21.237977, 81.703673],[21.238024, 81.70432],
  [21.238047, 81.704614],[21.238086, 81.705113],[21.238163, 81.706042],[21.238231, 81.706772],
  [21.238304, 81.707581],[21.238359, 81.708152],[21.238367, 81.708229],[21.238389, 81.708575],
  [21.238428, 81.709165],[21.238502, 81.709846],[21.238527, 81.710895],[21.238503, 81.711408],
  [21.238477, 81.711716],[21.238417, 81.712185],[21.238354, 81.712523],[21.238173, 81.713139],
  [21.237883, 81.713903],[21.237618, 81.714589],[21.237559, 81.714742],[21.237292, 81.715437],
  [21.236801, 81.716692],             [21.236726, 81.716895],[21.236373, 81.717844],[21.236248, 81.718211],
  [21.236168, 81.718528],[21.236067, 81.719088],[21.236037, 81.719512],[21.236023, 81.719686],
  [21.236014, 81.719802],[21.235981, 81.7202],[21.235948, 81.721128],[21.235904, 81.722037],
  [21.235936, 81.723163],[21.235906, 81.723902],[21.2359, 81.724042],[21.235778, 81.724722],
  [21.23564, 81.72539],[21.235616, 81.725961],[21.235706, 81.72648],[21.23593, 81.727116],
  [21.236175, 81.72785],[21.236274, 81.728376],[21.236391, 81.729053],[21.236453, 81.729474],
  [21.236597, 81.730118],[21.236648, 81.730693],[21.236615, 81.731222],[21.236522, 81.731639],
  [21.236361, 81.732146],[21.236011, 81.73264],[21.235658, 81.732983],[21.235263, 81.733269],
  [21.234895, 81.73348],[21.234558, 81.733567],[21.234115, 81.73366],[21.233415, 81.733589],
  [21.232826, 81.733374],[21.232393, 81.733185],[21.231869, 81.732932],[21.230889, 81.732476],
  [21.230084, 81.73213],[21.229713, 81.732011],[21.229349, 81.731924],[21.228625, 81.731822],
  [21.22823, 81.731777],[21.227611, 81.731825],[21.227276, 81.731857],[21.226463, 81.732072],
  [21.226134, 81.732188],[21.225368, 81.732572],[21.224806, 81.732977],[21.224397, 81.733333],
  [21.224086, 81.733638],[21.2237, 81.734074],[21.223622, 81.73416],[21.22312, 81.734699],
  [21.222178, 81.735687],[21.221651, 81.736278],[21.220321, 81.737699],[21.2191, 81.739008],
  [21.21788, 81.740326],[21.216588, 81.74176],[21.21527, 81.743185],[21.214241, 81.744368],
  [21.213321, 81.745485],[21.213062, 81.745799],[21.211693, 81.747586],[21.210209, 81.749604],
  [21.208983, 81.751371],[21.207673, 81.753306],[21.206543, 81.755138],[21.205424, 81.75695],
  [21.20491, 81.757839],[21.203938, 81.759398],[21.203355, 81.760373],[21.203305, 81.760459],
  [21.203244, 81.760564],[21.203103, 81.760805],[21.20188, 81.762898],[21.200812, 81.764669],
  [21.19973, 81.766507],[21.198964, 81.768152],[21.198335, 81.769762],[21.19824, 81.770003],
  [21.198037, 81.770619],[21.197597, 81.772098],[21.197319, 81.77291],[21.196854, 81.774411],
  [21.196696, 81.774859],[21.19665, 81.774979],[21.196534, 81.774935],[21.196365, 81.774873],
  [21.195433, 81.774528],[21.195037, 81.774381],[21.193601, 81.773847],[21.191323, 81.773],
  [21.18856, 81.771972],[21.187916, 81.771732],[21.187833, 81.771722],[21.187765, 81.771727],
  [21.187706, 81.771737],[21.187673, 81.771782],[21.187552, 81.771857],[21.187414, 81.771879],
  [21.187331, 81.771999],[21.187272, 81.772153],[21.186041, 81.775916],        [21.185492, 81.777596],
  [21.184887, 81.779447],[21.184848, 81.779565],[21.184738, 81.779524],[21.183012, 81.77888],
  [21.177681, 81.776899],[21.174217, 81.775609],[21.173866, 81.775478],[21.173764, 81.77544],
  [21.173369, 81.775293],[21.172522, 81.774977],[21.171006, 81.774416],[21.169968, 81.774031],
  [21.16648, 81.772733],[21.166367, 81.772769],[21.166264, 81.772799],[21.166184, 81.77285],
  [21.166107, 81.77293],[21.166037, 81.773007],[21.165574, 81.774432],[21.164582, 81.777457],
  [21.164514, 81.777662],[21.164158, 81.778749],[21.163485, 81.780811],[21.162764, 81.783018],
  [21.162732, 81.783117],[21.162126, 81.784972],[21.162048, 81.785226],[21.161871, 81.7858],
  [21.161831, 81.785972],[21.161805, 81.786201],[21.161835, 81.786357],[21.162019, 81.786501],
  [21.162252, 81.786672],[21.162622, 81.786828],[21.163834, 81.787276],[21.165623, 81.787937],
  [21.165781, 81.787996],[21.166961, 81.788436],[21.168886, 81.789154],[21.169239, 81.789286],
  [21.169347, 81.789326],[21.169255, 81.789607],[21.169124, 81.790015],[21.168453, 81.792086],
  [21.166858, 81.796989],[21.166691, 81.797501],[21.166657, 81.797605],[21.166565, 81.797888],
  [21.166548, 81.797941],[21.165575, 81.800908],[21.165529, 81.801048],[21.165417, 81.801006],
  [21.165101, 81.800885],[21.164285, 81.800572],[21.162762, 81.800003],[21.161907, 81.799663],
  [21.161821, 81.799746],[21.161711, 81.799788],[21.161595, 81.799782],[21.161491, 81.799728],
  [21.161463, 81.799695],[21.161413, 81.799636],[21.161374, 81.799518],[21.161102, 81.799502],
  [21.160656, 81.799419],[21.16047, 81.799373],[21.160328, 81.799338],[21.16001, 81.799269],
  [21.160052, 81.799192],[21.160085, 81.799199],[21.160326, 81.799248],[21.160525, 81.799266],
  [21.16047, 81.799373],[21.160328, 81.799338],[21.16001, 81.799269],[21.159332, 81.799124],
  [21.158914, 81.799012],[21.15805, 81.79878],[21.157864, 81.798752],[21.157709, 81.798745],
  [21.157559, 81.798772],[21.157359, 81.798863],[21.157229, 81.798868],[21.157104, 81.798825],
  [21.157052, 81.798774],[21.156979, 81.798702],[21.156884, 81.798525],[21.15674, 81.798361],
  [21.156492, 81.798213],[21.155997, 81.797992],[21.15592, 81.797958],[21.155759, 81.797886],
  [21.155268, 81.797648],[21.15479, 81.79739],[21.154644, 81.797311],[21.1544, 81.79718],
  [21.154186, 81.797062],[21.154017, 81.796969],[21.153788, 81.796864],[21.153301, 81.796612],
  [21.153232, 81.796662],[21.153152, 81.796689],[21.153087, 81.796693],[21.153022, 81.796682],
  [21.152962, 81.796656],[21.152908, 81.796616],[21.152854, 81.796551],[21.152819, 81.796472],
  [21.152805, 81.796385],[21.152814, 81.796298],[21.152844, 81.796217],[21.152853, 81.796204],
  [21.152894, 81.796147],[21.15296, 81.796095],[21.153036, 81.796064],[21.153118, 81.796056],
  [21.153538, 81.795172],[21.153963, 81.794583],[21.154579, 81.79398],[21.155086, 81.793651],
  [21.155162, 81.793586],[21.155205, 81.793497],[21.15527, 81.793412],[21.155372, 81.793352],
  [21.15546, 81.793327],[21.155546, 81.793328],[21.155637, 81.793355],[21.155789, 81.793274],
  [21.156231, 81.793117],[21.156928, 81.792995],[21.157522, 81.792968],[21.158178, 81.793017],
  [21.158598, 81.793132],[21.158699, 81.793028],[21.158828, 81.792972],[21.158891, 81.792971],
  [21.16009, 81.789205],[21.160133, 81.789072],[21.16021, 81.788835],[21.160462, 81.788065],
  [21.160481, 81.787981],[21.160536, 81.787736],[21.160567, 81.787453],[21.160552, 81.787183],
  [21.160562, 81.786917],[21.160484, 81.786791],[21.16043, 81.786652],[21.160173, 81.78641],
  [21.159924, 81.786199],[21.159643, 81.786058],[21.159485, 81.785978],[21.159207, 81.785872],
  [21.157506, 81.785231],[21.155484, 81.784492],[21.15406, 81.783972],[21.153935, 81.783926],
  [21.153624, 81.783843],[21.153567, 81.783821],[21.15316, 81.783667],[21.153021, 81.783614],
  [21.152728, 81.783503],[21.15261, 81.783458],[21.149731, 81.782263],[21.148337, 81.781684],
  [21.147734, 81.781389],[21.147273, 81.781175],[21.146956, 81.780986],[21.146685, 81.780817],
  [21.1466, 81.780766],[21.146501, 81.780706],[21.146464, 81.780816],[21.146295, 81.781322],
  [21.146027, 81.782125],[21.145824, 81.782756],[21.145783, 81.782883],[21.145668, 81.782841],
  [21.14538, 81.782734],[21.145139, 81.782642],[21.143643, 81.782081],[21.140773, 81.781006],
  [21.140515, 81.780909],[21.139268, 81.780442],[21.138451, 81.780141],[21.138154, 81.780031],
  [21.138038, 81.779989],[21.137717, 81.77987],[21.1354, 81.779016],[21.134789, 81.778791],
  [21.134185, 81.778568],[21.131223, 81.777461],[21.13109, 81.777483],[21.131002, 81.777516],
  [21.130891, 81.777584],[21.13078, 81.77766],[21.130156, 81.779564],[21.130087, 81.779775],
  [21.129595, 81.781276],[21.128636, 81.78422],[21.128524, 81.784563],[21.128487, 81.784677],
  [21.128387, 81.784986],[21.12786, 81.786605],[21.12728, 81.788389],[21.127295, 81.788473],
  [21.127312, 81.788565],[21.127352, 81.788667],[21.127392, 81.788762],[21.127358, 81.78887],
  [21.127169, 81.788962],[21.127059, 81.78907],[21.126353, 81.791247],[21.126237, 81.791585],
  [21.126109, 81.791956],[21.126068, 81.792081],[21.125968, 81.79204],[21.12568, 81.791936],
  [21.124956, 81.791674],[21.123757, 81.791233],[21.121554, 81.790412],[21.119214, 81.789534],
  [21.118625, 81.789318],[21.118532, 81.789284],[21.118568, 81.789164],[21.118695, 81.788763],
  [21.11953, 81.786133],[21.119943, 81.784912],[21.120238, 81.784043],[21.120721, 81.782547],
  [21.120934, 81.781889],[21.12096, 81.78181],[21.120976, 81.781761],[21.121236, 81.780977],
  [21.121406, 81.7804],[21.121672, 81.77967],[21.122012, 81.778624],[21.122082, 81.778408],
  [21.122149, 81.778234],[21.122186, 81.778122],[21.122221, 81.778018],[21.122317, 81.777726],
  [21.12306, 81.775459],[21.123339, 81.774609],[21.123387, 81.774462],[21.123785, 81.773275],
  [21.124232, 81.771901],[21.124782, 81.77021],[21.124777, 81.770077],[21.12473, 81.769916],
  [21.124654, 81.769763],[21.124566, 81.769678],[21.123917, 81.769433],[21.121955, 81.768694]
];

const WALKING_ROUTE = [
  [21.121945, 81.768724], // HNLU Bus Shelter
  [21.122600, 81.768850], // Along Naya Raipur Marg
  [21.123800, 81.769250],
  [21.124700, 81.769750], // Road intersection junction
  [21.125150, 81.769450], // Turn west towards campus entrance
  [21.125650, 81.768300], // Straight campus approach road
  [21.126100, 81.766900],
  [21.126350, 81.766100], // Main gate turnaround
  [21.126500, 81.765800]  // IIIT Naya Raipur Main Entrance
];

const IIIT_COORDS = [21.1265, 81.7658];

const DOWNLOAD_RESOURCES = [
  {
    name: "Bus Schedule",
    meta: "Daily Timings (PDF)",
    file: "/brts-timetable.pdf",
    icon: FileText,
    accent: "cyan"
  },
  {
    name: "Fare Chart",
    meta: "Slab Rates (PDF)",
    file: "/brts-fare-chart.pdf",
    icon: CreditCard,
    accent: "emerald"
  },
  {
    name: "Route Map",
    meta: "Full BRTS Line (PDF)",
    file: "/brts-route-map.pdf",
    icon: MapIcon,
    accent: "indigo"
  },
  {
    name: "Feeder 1 Path",
    meta: "Connecting Loop 1 (PDF)",
    file: "/brts-feeder1.pdf",
    icon: Navigation,
    accent: "amber"
  },
  {
    name: "Feeder 2 Path",
    meta: "Connecting Loop 2 (PDF)",
    file: "/brts-feeder2.pdf",
    icon: Navigation,
    accent: "rose"
  }
];

export default function TransitMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const walkingLayerRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showRoute, setShowRoute] = useState(true);
  const [showWalking, setShowWalking] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const bounds = L.latLngBounds([21.1000, 81.6100], [21.2750, 81.8150]);

    const map = L.map(mapContainerRef.current, {
      center: [21.1850, 81.7350],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: bounds,
      maxBoundsViscosity: 0.9,
      zoomControl: false
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const routeLine = L.polyline(SNAPPED_ROUTE, {
      color: '#2563eb',
      weight: 7,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routeLayerRef.current = routeLine;

    const walkLine = L.polyline(WALKING_ROUTE, {
      color: '#a855f7',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.95
    }).addTo(map);
    walkingLayerRef.current = walkLine;

const updateZoomVisuals = () => {
      const z = map.getZoom();
      if (z <= 12) {
        routeLine.setStyle({ weight: 6 });
        walkLine.setStyle({ weight: 2.5 });
      } else if (z <= 14) {
        routeLine.setStyle({ weight: 8 });
        walkLine.setStyle({ weight: 3.5 });
      } else {
        routeLine.setStyle({ weight: 10 });
        walkLine.setStyle({ weight: 5 });
      }

      const scale = z <= 12 ? '0.55' : z <= 14 ? '0.8' : '1';
      mapContainerRef.current?.style.setProperty('--pin-scale', scale);
    };

    map.on('zoomend', updateZoomVisuals);
    updateZoomVisuals();

    STATIONS.forEach((stn, idx) => {
      const icon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="position:relative; width:20px; height:28px; cursor:pointer; transform: scale(var(--pin-scale, 0.55)); transform-origin: 10px 28px; transition: transform 0.18s ease;">
            <svg viewBox="0 0 24 32" width="20" height="28" style="filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.5));">
              <defs>
                <radialGradient id="glassRedPin" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#fca5a5" stop-opacity="0.95"/>
                  <stop offset="55%" stop-color="#ef4444" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#991b1b" stop-opacity="0.95"/>
                </radialGradient>
              </defs>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z" 
                    fill="url(#glassRedPin)" 
                    stroke="rgba(255, 255, 255, 0.75)" 
                    stroke-width="1.2"/>
              <ellipse cx="12" cy="9" rx="4.5" ry="3" fill="rgba(255, 255, 255, 0.55)"/>
              <circle cx="12" cy="11" r="2.5" fill="#ffffff" opacity="0.95"/>
            </svg>
          </div>
        `,
        iconSize: [20, 28],
        iconAnchor: [10, 28],
        tooltipAnchor: [0, -30]
      });

      const marker = L.marker(stn.coords, { icon }).addTo(map);

     marker.bindTooltip(`
        <div style="font-family: inherit; font-size: 13px; font-weight: 800; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); padding: 3px 6px; letter-spacing: 0.02em;">
          ${stn.name}
        </div>
      `, { direction: 'top', className: 'station-tooltip' });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedStation(stn);
      });
    });
const iiitIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5), 0 0 12px rgba(56, 213, 232, 0.25);
          border: 1px solid rgba(56, 213, 232, 0.5);
          white-space: nowrap;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>🎓</span>
          <span>Dr. SPM IIIT Naya Raipur</span>
        </div>
      `,
      iconSize: [180, 28],
      iconAnchor: [50, 42]
    });

    const iiitMarker = L.marker(IIIT_COORDS, { icon: iiitIcon, zIndexOffset: 1000 }).addTo(map);
    iiitMarker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedStation({
        sequence: 'Campus',
        name: 'Dr. SPM IIIT Naya Raipur',
        type: 'campus',
        coords: IIIT_COORDS,
        note: 'Buses terminate at HNLU Gate Shelter. Walking/e-rickshaw link connects directly to Main Gate across Naya Raipur Marg.'
      });
    });

    map.on('click', () => {
      setSelectedStation(null);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Invalidate Leaflet canvas when toggling Full Screen mode
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 250);
    }
  }, [isFullScreen]);

  // Handle ESC key to exit full view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  useEffect(() => {
    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({ opacity: showRoute ? 0.95 : 0 });
    }
  }, [showRoute]);

  useEffect(() => {
    if (walkingLayerRef.current) {
      walkingLayerRef.current.setStyle({ opacity: showWalking ? 0.95 : 0 });
    }
  }, [showWalking]);

  const viewFullRoute = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([21.1850, 81.7350], 12, { duration: 0.8 });
      setSelectedStation(null);
    }
  };

  const focusIIIT = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(IIIT_COORDS, 16, { duration: 0.8 });
    }
  };

  return (
    <div className={`transit-experience-layout ${isFullScreen ? 'is-fullscreen-view' : ''}`}>
      {/* LEFT / CENTER: INTERACTIVE MAP CANVAS CONTAINER */}
      <div className="transit-map-frame">
        <div ref={mapContainerRef} className="transit-map-canvas" />

        {/* Floating Top Left Controls */}
        <div className="transit-map-hud">
          <div>
            <div className="transit-map-title">Tatpar BRTS Corridor</div>
            <div className="transit-map-subtitle">38.63 km • 16 Active Shelters</div>
          </div>

          <div className="transit-map-divider" />

          <button 
          onClick={() => setShowRoute(prev => !prev)} 
          className={`transit-btn ${showRoute ? 'transit-btn-toggle-on' : 'transit-btn-toggle-off'}`}
        >
          {showRoute ? 'Route: ON' : 'Route: OFF'}
        </button>

          <button onClick={focusIIIT} className="transit-btn transit-btn-primary">
            IIIT Campus
          </button>

          <button
            onClick={() => setShowWalking(prev => !prev)}
            className={`transit-btn ${showWalking ? 'transit-btn-toggle-on' : 'transit-btn-toggle-off'}`}
          >
            {showWalking ? 'Walking Link: ON' : 'Walking Link: OFF'}
          </button>
        </div>

        {/* Top Right Full-Screen Trigger */}
        <button 
          onClick={() => setIsFullScreen(prev => !prev)} 
          className="transit-fullscreen-btn"
          title={isFullScreen ? "Exit Fullscreen (Esc)" : "Expand Full View"}
        >
          {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          <span>{isFullScreen ? "Exit Fullscreen" : "Full View Mode"}</span>
        </button>

        {/* Selected Station Inspector Modal */}
        {selectedStation && (
          <div className="transit-inspector-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`transit-tag-${selectedStation.type}`}>
                  {selectedStation.type === 'campus' ? 'Campus Hub' : `Stop #${selectedStation.sequence}`}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {selectedStation.name}
                </div>
              </div>
              <button onClick={() => setSelectedStation(null)} className="transit-close-btn">
                &times;
              </button>
            </div>

            <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
              {selectedStation.note ? (
                <div>{selectedStation.note}</div>
              ) : (
                <>
                  <div><strong style={{ color: '#cbd5e1' }}>Previous:</strong> {selectedStation.prev || 'Start of line'}</div>
                  <div><strong style={{ color: '#cbd5e1' }}>Next:</strong> {selectedStation.next || 'End of line'}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: 5 QUICK-ACTION DOWNLOAD CARDS */}
      <div className="transit-downloads-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-badge">
            <Bus size={14} />
            <span>DOWNLOAD CENTER</span>
          </div>
          <h3>Route Assets</h3>
          <p>Official schedules, feeder loop paths, and fare charts for campus transit.</p>
        </div>

        <div className="sidebar-downloads-list">
          {DOWNLOAD_RESOURCES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a 
                key={idx} 
                href={item.file} 
                download 
                className={`download-card-tile accent-${item.accent}`}
              >
                <div className="tile-icon-box">
                  <Icon size={18} />
                </div>
                <div className="tile-content">
                  <span className="tile-title">{item.name}</span>
                  <span className="tile-meta">{item.meta}</span>
                </div>
                <div className="tile-action">
                  <Download size={16} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
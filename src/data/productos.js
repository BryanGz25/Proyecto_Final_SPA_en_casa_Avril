// descripcion: lista inicial de productos que alimenta el catalogo, la vista de usuario y el dashboard.
export const productosIniciales = [
  {
    id: 1,
    nombre: 'Jabon Botanico Nutritivo',
    categoria: 'jabones',
    detalle: 'Glicerina vegetal con romero, lavanda y calendula para pieles sensibles.',
    precio: 3500,
    disponible: true,
    etiqueta: 'Edicion botanica',
    imagen:
      'https://lh3.googleusercontent.com/aida/AEtjO1WBXP4WT3LJ2FMzP52uZ92cp1SZVeuScIgaJcmCUlcxv4YxJqld6k8NbpRwylyZneFlxL-YVY7ke3AflMseTXoSKKLg85r67VBK5db5K40qUQ-fLugVn85E9uZVsmJ92RjiArtFE8kU7Ml2Ft1soCK6AAYmEjSqGOGEKJ3dVcA41NAlW6VGCRwEz0MoBR_TM1U00MKHXCLJDX08YaPWRssnQIw4OPgtlDzPvXA_ffFTj6flDonsMjp_ePMl',
  },
  {
    id: 2,
    nombre: 'Sales de Bano & Relax',
    categoria: 'sales',
    detalle: 'Sales de epsom y manzanilla para descanso muscular y rituales relajantes.',
    precio: 4800,
    disponible: true,
    etiqueta: 'Relajacion pura',
    imagen:
      'https://lh3.googleusercontent.com/aida/AEtjO1W3n-xsIhXp-1bzKCES4mnlyhCsV5S69RBPH_pGpTC60y7RAcmlHgzVEp0lmEJsIT4uvmPC_8V_mbZ3nA489JmwXh_yjV6u69X70nRwRbhfznV6SP18U7oPdeZflZvlDkYsNebNKym9nkmNHVSczyw6qoXvBq_wV_daPBZqXR0PRRc73flIkFfwY01J4jXm15bq25sQcnBY67DggDV5sB-UGcm3CbUOV4dkC4auOGxBU32hIeAdpLpRpJ4',
  },
  {
    id: 3,
    nombre: 'Body Splash Floral & Citrico',
    categoria: 'splash',
    detalle: 'Bruma ligera con flor de naranjo para refrescar la piel durante el dia.',
    precio: 5200,
    disponible: true,
    etiqueta: 'Aromaterapia',
    imagen:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQcCr5nip8FspjPpcCDM13IWbjWpkUf3xuj1ENj6GYzicH12BFXrV0Gy4AgAsnRWMKKFUAFVa5Z_S8MvM_jUeDO4KB9SxaCmqR5PfZMF521lmwbYF5SG3KuQqmpc2W4G9vNj9_gwkBtoL7aihedBpb3nAntoJgd4QDnSd1XT94jiPaJLcC6CloGJ23ZGk60pb0SxQbLDZvZ85B0eLsQDsof-RpsxHr13Ng8cGS73Dcisd7KgTsMrIGjQ',
  },
  {
    id: 4,
    nombre: 'Jabones Tematicos & Regalos',
    categoria: 'decorativos',
    detalle: 'Disenos artesanales para bodas, regalos corporativos y celebraciones.',
    precio: 4000,
    disponible: false,
    etiqueta: 'Celebraciones',
    imagen:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBISCj7EhN-NpRbtEUmp_Q3-wf6Qfcp8Q4Ip-dQDk0SgG2yXu8F42kusb6lykAhm4gdgu-5wmBH48pShPwAcC6rtCToFATjDCRjYWQlRCPX1DsDZtOZfJIC-lMPAIZeSb6aIhrnhOpLmFyiVJykyhN6C5isp7Xeic-8mnmo_mw4HRgcqQYKIGqeMj8aQnxnaeOEE_LXUWhhIxSlMy3vHCvEqYwHeSFeLX1Z7Zl3CbRWgcpKegSjeKqbWA',
  },
]

// descripcion: categorias usadas por los filtros del catalogo y los paneles de administracion.
export const categorias = ['todos', 'jabones', 'sales', 'splash', 'decorativos']

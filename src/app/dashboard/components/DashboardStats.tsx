import { FC, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false })

type DashboardStatsProps = {
  spotifyData: {
    playCountData: {
      labels: string[]
      values: number[]
    }
    integrationStatus: 'connected' | 'disconnected' | 'error'
  }
  apiData: {
    substitutionsStatus: 'operational' | 'degraded' | 'down'
  }
  songRequestData: {
    labels: string[]
    values: number[]
  }
}

const DashboardStats: FC<DashboardStatsProps> = ({ spotifyData, apiData, songRequestData }) => {
  useEffect(() => {
    const Style = document.createElement('style')
    Style.textContent = `
      #chartjs-tooltip {
        position: fixed;
        pointer-events: none;
        transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        opacity: 0;
        transform: translateX(-50%) translateY(-5px);
        z-index: 10000;
        padding: 6px 12px;
        border-radius: 8px;
        background-color: rgba(15, 15, 15, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.75);
        font-family: JetBrains Mono, Consolas, Monaco, monospace;
        font-size: 12px;
        letter-spacing: 0px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), 0 2px 5px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 90px;
        text-align: center;
      }
      
      #chartjs-tooltip:after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        width: 10px;
        height: 10px;
        background-color: rgba(15, 15, 15, 0.85);
        transform: translateX(-50%) rotate(45deg);
        border-right: 1px solid rgba(255, 255, 255, 0.15);
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        z-index: -1;
      }
      
      #chartjs-tooltip-value {
        font-size: 16px;
        font-weight: 700;
      }
    `
    document.head.appendChild(Style)
    
    return () => {
      const TooltipEl = document.getElementById('chartjs-tooltip')
      if (TooltipEl) {
        TooltipEl.remove()
      }
      Style.remove()
    }
  }, [])

  const _StatusColors = {
    connected: 'bg-emerald-400',
    disconnected: 'bg-rose-400',
    error: 'bg-amber-400',
    operational: 'bg-emerald-400',
    degraded: 'bg-amber-400',
    down: 'bg-rose-400'
  }

  const _ChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: (context) => {
          const TooltipEl = document.getElementById('chartjs-tooltip')
          if (!TooltipEl) {
            const Div = document.createElement('div')
            Div.id = 'chartjs-tooltip'
            document.body.appendChild(Div)
          }
          
          const PositionEl = context.chart.canvas.getBoundingClientRect()
          const TooltipRoot = document.getElementById('chartjs-tooltip')
          
          if (TooltipRoot && context.tooltip.opacity !== 0) {
            const CurrentValue = context.tooltip.dataPoints?.[0]?.raw as number
            const ValueFormatted = CurrentValue.toLocaleString()
            
            TooltipRoot.innerHTML = `
              <div id="chartjs-tooltip-value">${ValueFormatted}</div>
            `
            
            TooltipRoot.style.opacity = '1'
            TooltipRoot.style.transform = 'translateX(-50%) translateY(-15px)'
            TooltipRoot.style.left = PositionEl.left + window.scrollX + context.tooltip.caretX + 'px'
            TooltipRoot.style.top = PositionEl.top + window.scrollY + context.tooltip.caretY - 30 + 'px'
            
            const DatasetIndex = context.tooltip.dataPoints[0].datasetIndex
            const BorderColor = context.chart.data.datasets[DatasetIndex].borderColor as string
            
            TooltipRoot.style.borderColor = borderColor(BorderColor, 0.3)
            TooltipRoot.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.6), 0 2px 5px rgba(0, 0, 0, 0.5), 0 0 0 1px ${borderColor(BorderColor, 0.15)}`
          } else if (TooltipRoot) {
            TooltipRoot.style.opacity = '0'
            TooltipRoot.style.transform = 'translateX(-50%) translateY(-5px)'
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 8
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 4,
        borderWidth: 2
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      }
    },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  const borderColor = (color: string, alpha: number): string => {
    if (color.includes('rgba')) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`)
    }
    return color
  }

  const SpotifyChartData: ChartData<'line'> = {
    labels: spotifyData.playCountData.labels,
    datasets: [
      {
        label: 'Odtworzenia',
        data: spotifyData.playCountData.values,
        borderColor: 'rgba(56, 224, 146, 0.9)',
        backgroundColor: 'rgba(56, 224, 146, 0.05)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(56, 224, 146, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: 'rgba(56, 224, 146, 1)', 
        pointHoverBorderWidth: 3,
        pointHoverRadius: 7,
        fill: true
      }
    ]
  }

  const SongRequestChartData: ChartData<'line'> = {
    labels: songRequestData.labels,
    datasets: [
      {
        label: 'Prośby',
        data: songRequestData.values,
        borderColor: 'rgba(246, 116, 90, 0.9)',
        backgroundColor: 'rgba(246, 116, 90, 0.05)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(246, 116, 90, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: 'rgba(246, 116, 90, 1)',
        pointHoverBorderWidth: 3,
        pointHoverRadius: 7,
        fill: true
      }
    ]
  }

  const _CardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const _StatusTranslations = {
    connected: 'połączono',
    disconnected: 'rozłączono',
    error: 'błąd',
    operational: 'działa',
    degraded: 'obniżona wydajność',
    down: 'niedostępne'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={_CardVariants}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-7 rounded-2xl backdrop-blur-xl bg-black/20 border border-white/8 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-emerald-800/5 to-transparent"></div>
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-emerald-400/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 group-hover:bg-emerald-400/10 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Odtworzenia Spotify</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-medium tracking-wide">Ostatnie 5 dni</p>
            </div>
            <div className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center w-12 h-12 shadow-lg">
              <i className="fab fa-spotify text-emerald-400 text-2xl"></i>
            </div>
          </div>
          <div className="h-72 pt-2">
            <Line options={_ChartOptions} data={SpotifyChartData} />
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={_CardVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative p-7 rounded-2xl backdrop-blur-xl bg-black/20 border border-white/8 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-rose-800/5 to-transparent"></div>
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4 group-hover:bg-rose-500/10 transition-all duration-700"></div>
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-orange-400/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 group-hover:bg-orange-400/10 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Song Requests</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-medium tracking-wide">Ostatnie 5 dni</p>
            </div>
            <div className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center w-12 h-12 shadow-lg">
              <i className="fas fa-music text-rose-400 text-2xl"></i>
            </div>
          </div>
          <div className="h-72 pt-2">
            <Line options={_ChartOptions} data={SongRequestChartData} />
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={_CardVariants}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative p-7 rounded-2xl backdrop-blur-xl bg-black/20 border border-white/8 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-teal-800/5 to-transparent"></div>
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-teal-400/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 group-hover:bg-teal-400/10 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">Integracja ze Spotify</h3>
            <div className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center w-12 h-12 shadow-lg">
              <i className="fab fa-spotify text-white text-2xl"></i>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-4 h-4 rounded-full ${_StatusColors[spotifyData.integrationStatus]} shadow-lg ring-2 ring-white/10 mr-3`}></div>
            <span className="text-xl font-bold text-white capitalize tracking-tight">{_StatusTranslations[spotifyData.integrationStatus]}</span>
          </div>
          <div className="mt-5 p-5 rounded-xl bg-white/5 backdrop-blur-lg border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 font-medium text-sm">Ostatnie sprawdzenie</span>
              <span className="text-white font-medium">Przed chwilą</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 font-medium text-sm">Typ usługi</span>
              <span className="text-white font-medium">Spotify API</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium text-sm">Token odświeżania</span>
              <span className="text-white font-medium">Aktywny</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={_CardVariants}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative p-7 rounded-2xl backdrop-blur-xl bg-black/20 border border-white/8 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-indigo-800/5 to-transparent"></div>
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4 group-hover:bg-blue-500/10 transition-all duration-700"></div>
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-indigo-400/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 group-hover:bg-indigo-400/10 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">API Zastępstwa</h3>
            <div className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center w-12 h-12 shadow-lg">
              <i className="fas fa-server text-indigo-400 text-2xl"></i>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-4 h-4 rounded-full ${_StatusColors[apiData.substitutionsStatus]} shadow-lg ring-2 ring-white/10 mr-3`}></div>
            <span className="text-xl font-bold text-white capitalize tracking-tight">{_StatusTranslations[apiData.substitutionsStatus]}</span>
          </div>
          <div className="mt-5 p-5 rounded-xl bg-white/5 backdrop-blur-lg border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 font-medium text-sm">Ostatnie sprawdzenie</span>
              <span className="text-white font-medium">Przed chwilą</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 font-medium text-sm">Adres końcowy</span>
              <span className="text-white font-medium">api.ox80.me/nullptr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium text-sm">Średni czas odpowiedzi</span>
              <span className="text-white font-medium">124ms</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardStats 
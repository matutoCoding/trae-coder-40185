import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { BrandConfig, CustomerRequirement, QuoteConfig, RoutePlan, QuoteResult } from '@/types'
import { hotelLevelLabels, ticketPackages } from '@/data/options'

export async function generatePDF(
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig,
  quote: QuoteResult,
  filename: string,
  quoteNote: string = ''
): Promise<boolean> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '794px'
  container.style.zIndex = '-1'
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
  document.body.appendChild(container)

  try {
    const pages = buildPDFPages(brand, requirement, route, config, quote, quoteNote)
    container.innerHTML = pages

    const pageElements = container.querySelectorAll('.pdf-page')
    const canvasList: HTMLCanvasElement[] = []

    for (let i = 0; i < pageElements.length; i++) {
      const canvas = await html2canvas(pageElements[i] as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      canvasList.push(canvas)
    }

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    canvasList.forEach((canvas, idx) => {
      if (idx > 0) pdf.addPage()
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
    })

    const buffer = pdf.output('arraybuffer')

    if (window.lushuAPI && window.lushuAPI.savePDF) {
      const result = await window.lushuAPI.savePDF(filename, buffer)
      return result.success
    }

    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } finally {
    document.body.removeChild(container)
  }
}

function buildPDFPages(
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig,
  quote: QuoteResult,
  quoteNote: string
): string {
  const selectedTickets = config.selectedTickets
    .map(id => ticketPackages.find(t => t.id === id)?.name)
    .filter(Boolean)
    .join('、')

  const dailyChunks = chunkDailyPlans(route.dailyPlans)
  const totalPages = 4 + dailyChunks.length + 3

  const pages: string[] = []

  pages.push(buildCoverPage(brand, requirement, route, 1, totalPages))
  pages.push(buildOverviewPage(brand, requirement, route, 2, totalPages))

  dailyChunks.forEach((chunk, idx) => {
    pages.push(buildDailyPage(brand, route, chunk, 3 + idx, totalPages))
  })

  const quotePageNum = 3 + dailyChunks.length
  pages.push(buildQuotePage(brand, requirement, route, config, quote, selectedTickets, quoteNote, quotePageNum, totalPages))
  pages.push(buildNotesPage(brand, quotePageNum + 1, totalPages))
  pages.push(buildMapPage(brand, route, quotePageNum + 2, totalPages))
  pages.push(buildConfirmPage(brand, requirement, route, quote, quotePageNum + 3, totalPages))

  return pages.map(html => `<div class="pdf-page" style="width:794px;min-height:1123px;background:#fff;position:relative;overflow:hidden;box-sizing:border-box;">${html}</div>`).join('')
}

function chunkDailyPlans(plans: any[]) {
  const chunks: any[][] = []
  let current: any[] = []
  let currentHeight = 0

  const headerHeight = 120
  const footerHeight = 40
  const pageAvailable = 1123 - headerHeight - footerHeight - 60
  const baseRowHeight = 95

  plans.forEach(plan => {
    const highlightLines = Math.ceil(plan.highlights.length / 2)
    const rowHeight = baseRowHeight + (highlightLines - 1) * 18

    if (currentHeight + rowHeight > pageAvailable && current.length > 0) {
      chunks.push(current)
      current = []
      currentHeight = 0
    }
    current.push(plan)
    currentHeight += rowHeight
  })

  if (current.length > 0) chunks.push(current)
  return chunks
}

function pageHeader(brand: BrandConfig, title: string) {
  return `
    <div style="padding:20px 30px 12px;border-bottom:2px solid #e0e7ff;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(to right, #f8fafc, #fff);">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg, #3b82f6, #1e3a8a);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">🚗</div>
        <div>
          <div style="font-size:14px;font-weight:bold;color:#1e3a8a;">${brand.agencyName || '旅行社'}</div>
          <div style="font-size:10px;color:#64748b;">${brand.slogan || ''}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#475569;font-weight:600;">${title}</div>
        <div style="font-size:9px;color:#94a3b8;">${brand.consultantName} · ${brand.consultantPhone}</div>
      </div>
    </div>
  `
}

function pageFooter(brand: BrandConfig, pageNum: number, total: number) {
  return `
    <div style="position:absolute;bottom:0;left:0;right:0;padding:12px 30px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#94a3b8;background:#f8fafc;">
      <span>${brand.agencyName || ''} · ${brand.agencyAddress || ''}</span>
      <span>第 ${pageNum} / ${total} 页</span>
    </div>
  `
}

function buildCoverPage(brand: BrandConfig, requirement: CustomerRequirement, route: RoutePlan, pageNum: number, totalPages: number) {
  return `
    <div style="width:100%;height:100%;background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #60a5fa 100%);position:relative;overflow:hidden;">
      <div style="position:absolute;right:-60px;top:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.1);"></div>
      <div style="position:absolute;left:-40px;bottom:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>
      <div style="position:absolute;right:20%;bottom:20%;width:80px;height:80px;border-radius:50%;background:rgba(251,191,36,0.25);"></div>

      <div style="padding:80px 60px 60px;color:white;position:relative;z-index:10;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
        <div style="font-size:22px;font-weight:bold;margin-bottom:6px;letter-spacing:1px;">${brand.agencyName || '旅行社'}</div>
        <div style="font-size:11px;opacity:80%;margin-bottom:60px;">${brand.slogan || ''}</div>

        <div style="font-size:12px;opacity:85%;letter-spacing:4px;margin-bottom:16px;">定 制 自 驾 旅 游 方 案</div>

        <div style="font-size:44px;font-weight:bold;line-height:1.2;margin-bottom:14px;letter-spacing:2px;text-shadow:0 2px 8px rgba(0,0,0,0.2);">
          ${requirement.destination || '川西秘境'}
        </div>

        <div style="font-size:18px;font-weight:300;margin-bottom:40px;opacity:95%;">
          ${requirement.days}天${requirement.days - 1}晚 · ${route.name}行程
        </div>

        <div style="width:70px;height:4px;background:#fbbf24;border-radius:2px;margin-bottom:36px;"></div>

        <div style="font-size:13px;line-height:2;opacity:95%;">
          <div style="margin-bottom:4px;">客户姓名：${requirement.customerName || '尊贵客户'}</div>
          <div style="margin-bottom:4px;">出行人数：${requirement.peopleCount}人</div>
          <div style="margin-bottom:4px;">出团日期：${requirement.travelDate || '待定'}</div>
          <div style="margin-bottom:4px;">行程类型：${route.name} · ${route.tagline}</div>
        </div>

        <div style="flex:1;"></div>

        <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:40px;border-top:1px solid rgba(255,255,255,0.2);">
          <div style="font-size:11px;line-height:1.8;opacity:90%;">
            <div>定制顾问：${brand.consultantName || ''}</div>
            <div>职　　位：${brand.consultantTitle || ''}</div>
            <div>联系电话：${brand.consultantPhone || ''}</div>
            <div>微　　信：${brand.consultantWechat || ''}</div>
          </div>
          <div style="text:right;font-size:10px;line-height:1.8;opacity:80%;">
            ${brand.agencyAddress ? `<div>${brand.agencyAddress}</div>` : ''}
            ${brand.agencyWebsite ? `<div>${brand.agencyWebsite}</div>` : ''}
          </div>
        </div>

        <div style="text-align:center;font-size:9px;opacity:60%;margin-top:30px;">
          第 ${pageNum} / ${totalPages} 页 · 本方案由路书制作工具自动生成 · 最终解释权归本社所有
        </div>
      </div>
    </div>
  `
}

function buildOverviewPage(brand: BrandConfig, requirement: CustomerRequirement, route: RoutePlan, pageNum: number, totalPages: number) {
  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '一、行程概览')}

      <div style="padding:24px 30px;">
        <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
          <div style="font-size:15px;font-weight:bold;color:#1e40af;margin-bottom:10px;">
            行程主题：${route.name} · ${route.tagline}
          </div>
          <div style="font-size:11px;color:#3b82f6;line-height:1.7;">
            ${route.description}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px;">
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;width:20%;">目的地</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.destination || '川西环线'}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;width:20%;">行程天数</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.days}天${requirement.days - 1}晚</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;">出行人数</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.peopleCount}人</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;">总里程</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${route.totalDriveDistance}km</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;">交通方式</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.transportType === 'rental' ? '租车自驾' : '自带车辆'}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#eff6ff;color:#1e40af;font-weight:bold;">出团日期</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.travelDate || '待定'}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-bottom:20px;">
          <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span style="width:4px;height:14px;background:#3b82f6;border-radius:2px;"></span>
            行程亮点
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${route.highlights.map((h, i) => `
              <div style="display:flex;align-items:flex-start;gap:6px;font-size:11px;color:#475569;">
                <span style="color:${route.accentColor};font-weight:bold;">•</span>
                <span>${h}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span style="width:4px;height:14px;background:${route.accentColor};border-radius:2px;"></span>
            可能的超预算项
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;">
            ${route.potentialOverBudget.map((item, i) => `
              <div style="font-size:11px;color:#92400e;margin-bottom:4px;">⚠️ ${item}</div>
            `).join('')}
          </div>
        </div>
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

function buildDailyPage(brand: BrandConfig, route: RoutePlan, dailyPlans: any[], pageNum: number, totalPages: number) {
  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '二、每日行程安排')}

      <div style="padding:20px 30px;">
        <div style="position:relative;">
          <div style="position:absolute;left:26px;top:10px;bottom:10px;width:2px;background:${route.accentColor}30;border-radius:1px;"></div>

          <div style="display:flex;flex-direction:column;gap:12px;">
            ${dailyPlans.map(day => `
              <div style="display:flex;gap:14px;position:relative;">
                <div style="width:52px;height:52px;border-radius:10px;background:${route.accentColor};color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;z-index:5;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                  <div style="font-size:9px;opacity:85%;">DAY</div>
                  <div style="font-size:18px;font-weight:bold;line-height:1;">${day.day}</div>
                </div>

                <div style="flex:1;background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                    <div>
                      <div style="font-size:12px;font-weight:bold;color:#0f172a;margin-bottom:3px;">${day.title}</div>
                      <div style="font-size:10px;color:#64748b;">
                        📍 ${day.stayCity}　🏨 ${day.hotelName}
                      </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-shrink:0;">
                      <span style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 8px;font-size:10px;color:#475569;">
                        🚗 ${day.driveDuration}
                      </span>
                      <span style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 8px;font-size:10px;color:#475569;">
                        📏 ${day.driveDistance}km
                      </span>
                    </div>
                  </div>

                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
                    ${day.highlights.map((h: string, i: number) => `
                      <span style="background:${route.accentColor}15;color:${route.accentColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:500;">
                        ${h}
                      </span>
                    `).join('')}
                  </div>

                  ${day.overBudgetRisk ? `
                    <div style="margin-top:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:6px 10px;font-size:10px;color:#92400e;">
                      ⚠️ ${day.overBudgetRisk}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

function buildQuotePage(
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig,
  quote: QuoteResult,
  selectedTickets: string,
  quoteNote: string,
  pageNum: number,
  totalPages: number
) {
  const pc = requirement.peopleCount
  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '三、费用说明')}

      <div style="padding:24px 30px;">
        <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6);border-radius:12px;padding:20px 24px;color:white;margin-bottom:20px;box-shadow:0 4px 12px rgba(30,64,175,0.2);">
          <div style="font-size:11px;opacity:80%;margin-bottom:6px;">建议报价区间（${requirement.peopleCount}人）</div>
          <div style="font-size:28px;font-weight:bold;letter-spacing:1px;">
            ¥${quote.totalMin.toLocaleString()}
            <span style="font-size:16px;opacity:70%;margin:0 8px;">~</span>
            ¥${quote.totalMax.toLocaleString()}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:8px;">
            <span style="opacity:80;">人均 ¥${Math.round(quote.totalMin / requirement.peopleCount).toLocaleString()} 起</span>
            <span style="color:#fcd34d;font-weight:bold;">毛利率约 ${quote.profitMargin}%</span>
          </div>
        </div>

        <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:12px;">
          3.1 费用明细
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px;">
          <thead>
            <tr style="background:#1e40af;color:white;">
              <th style="padding:10px 14px;text-align:left;font-weight:bold;">项目</th>
              <th style="padding:10px 14px;text-align:left;font-weight:bold;">说明</th>
              <th style="padding:10px 14px;text-align:right;font-weight:bold;width:100px;">总价</th>
              <th style="padding:10px 14px;text-align:right;font-weight:bold;width:90px;">人均</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:bold;color:#1e40af;">🏨 酒店住宿</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${hotelLevelLabels[config.selectedHotelLevel]} × ${requirement.days - 1}晚</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">¥${quote.hotelCost.toLocaleString()}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.hotelCost / pc).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:bold;color:#1e40af;">🎫 门票组合</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${selectedTickets || '客户自理'}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">¥${quote.ticketCost.toLocaleString()}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.ticketCost / pc).toLocaleString()}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px 8px 28px;border:1px solid #e2e8f0;color:#475569;">├ 👨‍✈️ 专业领队</td>
              <td style="padding:10px 14px 8px 14px;border:1px solid #e2e8f0;font-size:10px;color:#64748b;">高原经验+急救证（全程）</td>
              <td style="padding:10px 14px 8px 14px;border:1px solid #e2e8f0;text-align:right;">¥${quote.serviceBreakdown.leaderCost.toLocaleString()}</td>
              <td style="padding:10px 14px 8px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.serviceBreakdown.leaderCost / pc).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 14px 8px 28px;border:1px solid #e2e8f0;color:#475569;">├ 🆘 应急救援</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;font-size:10px;color:#64748b;">卫星电话+拖车服务</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;text-align:right;">¥${quote.serviceBreakdown.rescueCost.toLocaleString()}</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.serviceBreakdown.rescueCost / pc).toLocaleString()}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:8px 14px 8px 28px;border:1px solid #e2e8f0;color:#475569;">├ 🛡️ 旅游保险</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;font-size:10px;color:#64748b;">高原专项保障</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;text-align:right;">¥${quote.serviceBreakdown.insuranceCost.toLocaleString()}</td>
              <td style="padding:8px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.serviceBreakdown.insuranceCost / pc).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 14px 10px 28px;border:1px solid #e2e8f0;color:#475569;">└ 🍽️ 餐饮包</td>
              <td style="padding:8px 14px 10px 14px;border:1px solid #e2e8f0;font-size:10px;color:#64748b;">含特色餐体验</td>
              <td style="padding:8px 14px 10px 14px;border:1px solid #e2e8f0;text-align:right;">¥${quote.serviceBreakdown.mealsCost.toLocaleString()}</td>
              <td style="padding:8px 14px 10px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.serviceBreakdown.mealsCost / pc).toLocaleString()}</td>
            </tr>
            <tr style="background:#eff6ff;">
              <td style="padding:10px 14px;border:1px solid #bfdbfe;font-weight:bold;color:#1e40af;">🛠️ 增值服务小计</td>
              <td style="padding:10px 14px;border:1px solid #bfdbfe;">
                ${[
                  config.includeLeader ? '专业领队' : '',
                  config.includeRescue ? '救援服务' : '',
                  config.includeInsurance ? '保险' : '',
                  config.includeMeals ? '餐饮包' : '',
                ].filter(Boolean).join('、') || '无'}
              </td>
              <td style="padding:10px 14px;border:1px solid #bfdbfe;text-align:right;font-weight:bold;">¥${quote.serviceCost.toLocaleString()}</td>
              <td style="padding:10px 14px;border:1px solid #bfdbfe;text-align:right;color:#1e40af;">¥${Math.round(quote.serviceCost / pc).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:bold;color:#1e40af;">🚗 交通及其他</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;">${requirement.transportType === 'rental' ? '租车费用+保险' : '车辆服务'}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">¥${quote.otherCost.toLocaleString()}</td>
              <td style="padding:10px 14px;border:1px solid #e2e8f0;text-align:right;color:#64748b;">¥${Math.round(quote.otherCost / pc).toLocaleString()}</td>
            </tr>
            <tr style="background:#f0fdf4;border-top:2px solid #22c55e;">
              <td style="padding:10px 14px;border:1px solid #bbf7d0;font-weight:bold;color:#16a34a;">💵 计划利润</td>
              <td style="padding:10px 14px;border:1px solid #bbf7d0;">毛利率 ${config.profitMargin}%</td>
              <td style="padding:10px 14px;border:1px solid #bbf7d0;text-align:right;font-weight:bold;color:#16a34a;">¥${quote.profit.toLocaleString()}</td>
              <td style="padding:10px 14px;border:1px solid #bbf7d0;text-align:right;color:#22c55e;">¥${Math.round(quote.profit / pc).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        ${quoteNote ? `
          <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
            <div style="font-size:11px;font-weight:bold;color:#9a3412;margin-bottom:6px;">📝 报价备注</div>
            <div style="font-size:11px;color:#78350f;line-height:1.7;white-space:pre-wrap;">${quoteNote}</div>
          </div>
        ` : ''}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;">
            <div style="font-size:12px;font-weight:bold;color:#15803d;margin-bottom:8px;">✓ 费用包含项目</div>
            <div style="font-size:10px;color:#166534;line-height:2;">
              ${route.included.map((x: string) => `<div>• ${x}</div>`).join('')}
            </div>
          </div>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;">
            <div style="font-size:12px;font-weight:bold;color:#b91c1c;margin-bottom:8px;">✗ 费用不含项目</div>
            <div style="font-size:10px;color:#dc2626;line-height:2;">
              ${route.notIncluded.map((x: string) => `<div>• ${x}</div>`).join('')}
            </div>
          </div>
        </div>

        ${quote.warnings.length > 0 ? `
          <div style="margin-top:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;">
            <div style="font-size:11px;font-weight:bold;color:#92400e;margin-bottom:6px;">⚠️ 温馨提示</div>
            ${quote.warnings.map(w => `<div style="font-size:10px;color:#a16207;margin-bottom:3px;">${w}</div>`).join('')}
          </div>
        ` : ''}
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

function buildNotesPage(brand: BrandConfig, pageNum: number, totalPages: number) {
  const sections = [
    {
      icon: '🎒',
      title: '4.1 出行准备',
      items: [
        '携带本人有效身份证件、学生证、军官证等优惠证件',
        '高原地区紫外线强，请准备防晒霜、墨镜、遮阳帽',
        '昼夜温差大，建议携带冲锋衣、羽绒服等保暖衣物',
        '建议自备洗漱用品、保温杯、常用药品（感冒、肠胃药）',
        '出发前请保持良好睡眠，避免饮酒，预防高原反应',
        '请随身携带充电宝、数据线，保持通讯畅通',
      ]
    },
    {
      icon: '🛡️',
      title: '4.2 安全须知',
      items: [
        '自驾行程请严格遵守交通规则，严禁疲劳驾驶',
        '高原行车注意车辆状况，每日出发前检查车辆',
        '请勿单独前往偏僻区域，保持与团队通讯畅通',
        '景区游览请走正规步道，切勿踏入未开发区域',
        '如发生身体不适或突发状况，请第一时间联系领队',
        '高原地区行动宜缓不宜快，给身体适应时间',
      ]
    },
    {
      icon: '🙏',
      title: '4.3 风俗习惯',
      items: [
        '尊重当地少数民族风俗习惯，不随意拍摄当地居民',
        '进入寺庙参观请脱帽，不戴墨镜，遵守寺内规定',
        '藏区忌用单手接递物品，接受哈达请双手承接',
        '不随意踩跨经幡、玛尼堆等宗教设施',
        '如需要购买特产纪念品，请确认价格和品质',
        '与当地人交流请礼貌友善，尊重文化差异',
      ]
    },
    {
      icon: '📋',
      title: '4.4 退改政策',
      items: [
        '出发前15天取消，退还全款的100%',
        '出发前7-14天取消，退还全款的70%',
        '出发前3-6天取消，退还全款的50%',
        '出发前2天内取消，不予退款',
        '行程中因个人原因取消，未产生费用可协商退还',
        '因不可抗力因素导致行程变更，双方协商解决',
      ]
    },
  ]

  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '四、出行注意事项')}

      <div style="padding:20px 30px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          ${sections.map(sec => `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
              <div style="font-size:12px;font-weight:bold;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <span>${sec.icon}</span>
                ${sec.title}
              </div>
              <div style="font-size:10px;color:#475569;line-height:2;">
                ${sec.items.map(item => `<div style="display:flex;gap:6px;align-items:flex-start;"><span style="color:#f59e0b;font-weight:bold;">•</span><span>${item}</span></div>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:20px;background:linear-gradient(135deg, #eff6ff, #e0e7ff);border-radius:10px;padding:16px 20px;">
          <div style="font-size:12px;font-weight:bold;color:#1e40af;margin-bottom:6px;">💡 旅行小贴士</div>
          <div style="font-size:10px;color:#3730a3;line-height:1.8;">
            建议出发前一周开始服用红景天等抗高反药物；抵达高原后第一天请勿洗澡；多喝温水，少饮酒；
            如出现严重头痛、呕吐等症状，请立即下降海拔并就医。旅行最重要的是安全和心情，祝您旅途愉快！
          </div>
        </div>
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

function buildMapPage(brand: BrandConfig, route: RoutePlan, pageNum: number, totalPages: number) {
  const cities = [...new Set(route.dailyPlans.map(d => d.stayCity))]
  const points = cities.map((name, i) => {
    const t = cities.length <= 1 ? 0 : i / (cities.length - 1)
    return {
      x: 60 + t * 640,
      y: 120 + Math.sin(i * 1.3) * 60 + i * 18,
      name,
      day: i + 1,
    }
  })

  const pathD = points.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ')

  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '五、行程地图示意')}

      <div style="padding:24px 30px;">
        <div style="position:relative;background:linear-gradient(180deg, #f0f9ff, #e0f2fe);border:1px solid #bfdbfe;border-radius:12px;padding:20px;height:380px;overflow:hidden;">
          <div style="position:absolute;inset:0;opacity:0.3;">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#93c5fd" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <svg style="position:relative;z-index:5;width:100%;height:100%;" viewBox="0 0 760 340" preserveAspectRatio="xMidYMid meet">
            <path d="${pathD}" fill="none" stroke="${route.accentColor}" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round"/>

            ${points.map(p => `
              <g>
                <circle cx="${p.x}" cy="${p.y}" r="7" fill="white" stroke="${route.accentColor}" stroke-width="2.5"/>
                <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#ef4444"/>
                <text x="${p.x + 14}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="bold">${p.name}</text>
                <text x="${p.x + 14}" y="${p.y + 18}" fill="#64748b" font-size="10">D${p.day}</text>
              </g>
            `).join('')}
          </svg>

          <div style="position:absolute;bottom:12px;left:16px;right:16px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;background:rgba(255,255,255,0.9);padding:6px 12px;border-radius:6px;backdrop-filter:blur(4px);">
            <div style="display:flex;gap:16px;">
              <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></span>住宿城市</span>
              <span style="display:flex;align-items:center;gap:4px;"><span style="width:20px;height:2px;background:${route.accentColor};"></span>行车路线</span>
            </div>
            <span style="font-weight:bold;color:#1e40af;">总里程 ${route.totalDriveDistance}km</span>
          </div>
        </div>

        <div style="margin-top:20px;">
          <div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:10px;">行车建议</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px;color:#475569;line-height:2;">
            <div style="display:flex;gap:6px;align-items:flex-start;"><span style="color:#3b82f6;font-weight:bold;">•</span>每日出发前规划好行车路线，关注实时路况</div>
            <div style="display:flex;gap:6px;align-items:flex-start;"><span style="color:#3b82f6;font-weight:bold;">•</span>高原地区加油站间距大，半箱油及时补加</div>
            <div style="display:flex;gap:6px;align-items:flex-start;"><span style="color:#3b82f6;font-weight:bold;">•</span>停车拍照选安全区域，勿在弯道坡道停留</div>
            <div style="display:flex;gap:6px;align-items:flex-start;"><span style="color:#3b82f6;font-weight:bold;">•</span>山区信号不佳，请提前下载离线地图</div>
          </div>
        </div>
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

function buildConfirmPage(
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  quote: QuoteResult,
  pageNum: number,
  totalPages: number
) {
  return `
    <div style="padding:0;position:relative;height:100%;box-sizing:border-box;">
      ${pageHeader(brand, '五、客户确认')}

      <div style="padding:30px 40px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:20px;font-weight:bold;color:#1e3a8a;letter-spacing:2px;">行程确认单</div>
          <div style="width:60px;height:3px;background:linear-gradient(90deg,#3b82f6,#fbbf24);border-radius:2px;margin:10px auto 0;"></div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
          <div style="font-size:12px;font-weight:bold;color:#1e40af;margin-bottom:12px;">📋 客户信息</div>
          <table style="width:100%;font-size:11px;">
            <tbody>
              <tr>
                <td style="padding:8px 12px;color:#64748b;width:100px;">客户姓名</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;">${requirement.customerName || '____________'}</td>
                <td style="padding:8px 12px;color:#64748b;width:100px;">联系电话</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;">${requirement.phone || '____________'}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:8px 12px;color:#64748b;">出行人数</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;">${requirement.peopleCount} 人</td>
                <td style="padding:8px 12px;color:#64748b;">出团日期</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;">${requirement.travelDate || '____________'}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;color:#64748b;">目的地</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;" colspan="3">${requirement.destination || '川西环线'}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:8px 12px;color:#64748b;">行程方案</td>
                <td style="padding:8px 12px;font-weight:bold;color:#0f172a;" colspan="3">${route.name}方案 · ${requirement.days}天${requirement.days - 1}晚 · 总里程 ${route.totalDriveDistance}km</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6);border-radius:12px;padding:20px 24px;color:white;margin-bottom:20px;">
          <div style="font-size:11px;opacity:80%;margin-bottom:6px;">合同总报价（${requirement.peopleCount}人）</div>
          <div style="font-size:26px;font-weight:bold;letter-spacing:1px;">
            ¥${quote.totalMin.toLocaleString()}
            <span style="font-size:14px;opacity:70%;margin:0 8px;">~</span>
            ¥${quote.totalMax.toLocaleString()}
          </div>
          <div style="font-size:10px;margin-top:6px;opacity:80%;">
            人均 ¥${Math.round(quote.totalMin / requirement.peopleCount).toLocaleString()} 起 · 毛利率 ${quote.profitMargin}%
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;">
            <div style="font-size:11px;font-weight:bold;color:#15803d;margin-bottom:8px;">✓ 费用包含项目</div>
            <div style="font-size:10px;color:#166534;line-height:1.9;">
              ${route.included.slice(0, 5).map((x: string) => `<div>• ${x}</div>`).join('')}
            </div>
          </div>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;">
            <div style="font-size:11px;font-weight:bold;color:#b91c1c;margin-bottom:8px;">✗ 费用不含项目</div>
            <div style="font-size:10px;color:#dc2626;line-height:1.9;">
              ${route.notIncluded.slice(0, 5).map((x: string) => `<div>• ${x}</div>`).join('')}
            </div>
          </div>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:30px;">
          <div style="font-size:11px;font-weight:bold;color:#92400e;margin-bottom:6px;">📌 特别约定</div>
          <div style="font-size:10px;color:#78350f;line-height:1.8;">
            ${requirement.specialRequests ? `
              <div style="margin-bottom:6px;">客户特殊需求：${requirement.specialRequests}</div>
            ` : ''}
            <div>1. 本确认单经双方签字后生效，作为旅游合同附件</div>
            <div>2. 行程中如遇不可抗力因素，双方协商调整</div>
            <div>3. 具体退改政策详见旅游合同正文</div>
          </div>
        </div>

        <div style="padding-top:20px;border-top:2px solid #e2e8f0;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
            <div>
              <div style="font-size:11px;font-weight:bold;color:#1e40af;margin-bottom:6px;">旅行社确认</div>
              <div style="background:#fafafa;border:1px dashed #cbd5e1;border-radius:8px;padding:14px;">
                <div style="font-size:10px;color:#64748b;margin-bottom:4px;">机构名称：${brand.agencyName}</div>
                <div style="font-size:10px;color:#64748b;margin-bottom:12px;">顾问：${brand.consultantName}（${brand.consultantPhone}）</div>
                <div style="height:40px;"></div>
                <div style="font-size:10px;color:#94a3b8;border-top:1px solid #cbd5e1;padding-top:4px;">签字 / 盖章</div>
                <div style="font-size:10px;color:#94a3b8;margin-top:4px;">日期：______________</div>
              </div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:bold;color:#16a34a;margin-bottom:6px;">客户确认</div>
              <div style="background:#fafafa;border:1px dashed #86efac;border-radius:8px;padding:14px;">
                <div style="font-size:10px;color:#64748b;margin-bottom:4px;">参团人员：${requirement.peopleCount} 人</div>
                <div style="font-size:10px;color:#64748b;margin-bottom:12px;">联系人：${requirement.customerName || '____________'}</div>
                <div style="height:40px;"></div>
                <div style="font-size:10px;color:#94a3b8;border-top:1px solid #cbd5e1;padding-top:4px;">客户签字</div>
                <div style="font-size:10px;color:#94a3b8;margin-top:4px;">日期：______________</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${pageFooter(brand, pageNum, totalPages)}
    </div>
  `
}

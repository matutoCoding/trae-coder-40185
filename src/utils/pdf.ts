import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BrandConfig, CustomerRequirement, QuoteConfig, RoutePlan, QuoteResult } from '@/types'
import { hotelLevelLabels, ticketPackages } from '@/data/options'
import { getHotelLevelName } from '@/utils/quote'

export async function generatePDF(
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig,
  quote: QuoteResult,
  filename: string
): Promise<boolean> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  drawCover(doc, brand, requirement, route, pageWidth, pageHeight, margin)

  doc.addPage()
  drawHeader(doc, brand, pageWidth, margin)
  drawItineraryInfo(doc, requirement, route, margin)
  drawDailyPlans(doc, route, pageWidth, margin)

  doc.addPage()
  drawHeader(doc, brand, pageWidth, margin)
  drawQuoteSection(doc, requirement, route, config, quote, margin)

  doc.addPage()
  drawHeader(doc, brand, pageWidth, margin)
  drawNotes(doc, margin, pageHeight)

  doc.addPage()
  drawHeader(doc, brand, pageWidth, margin)
  drawMapSection(doc, route, pageWidth, margin, pageHeight)

  const buffer = doc.output('arraybuffer')

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
  URL.revokeObjectURL(url)
  return true
}

function drawCover(
  doc: jsPDF,
  brand: BrandConfig,
  requirement: CustomerRequirement,
  route: RoutePlan,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFillColor(59, 130, 246)
  doc.circle(pageWidth * 0.8, pageHeight * 0.15, 40, 'F')
  doc.setFillColor(96, 165, 250)
  doc.circle(pageWidth * 0.15, pageHeight * 0.85, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text(brand.agencyName || '星空旅行社', margin, pageHeight * 0.2)

  if (brand.slogan) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(brand.slogan, margin, pageHeight * 0.2 + 8)
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('定 制 自 驾 旅 游 方 案', margin, pageHeight * 0.35)

  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  const destText = requirement.destination || '川西秘境'
  doc.text(destText, margin, pageHeight * 0.42)

  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.text(`${requirement.days}天${requirement.days - 1}晚 · ${route.name}行程`, margin, pageHeight * 0.48)

  doc.setFillColor(245, 158, 11)
  doc.rect(margin, pageHeight * 0.52, 50, 1, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const infoItems = [
    `客户姓名：${requirement.customerName || '尊贵客户'}`,
    `出行人数：${requirement.peopleCount}人`,
    `出团日期：${requirement.travelDate || '待定'}`,
    `行程类型：${route.name} ${route.tagline}`,
  ]
  infoItems.forEach((item, i) => {
    doc.text(item, margin, pageHeight * 0.58 + i * 7)
  })

  doc.setFontSize(10)
  doc.setTextColor(191, 219, 254)
  const bottomY = pageHeight - margin - 20
  const contactItems = [
    `顾问：${brand.consultantName || '定制游顾问'}`,
    `职务：${brand.consultantTitle || '高级定制师'}`,
    `电话：${brand.consultantPhone || '138-0000-0000'}`,
    `微信：${brand.consultantWechat || 'lushu_consultant'}`,
  ]
  contactItems.forEach((item, i) => {
    doc.text(item, margin, bottomY + i * 5)
  })

  if (brand.agencyAddress) {
    doc.text(`地址：${brand.agencyAddress}`, pageWidth * 0.45, bottomY + 5)
  }
  if (brand.agencyWebsite) {
    doc.text(`官网：${brand.agencyWebsite}`, pageWidth * 0.45, bottomY + 10)
  }

  doc.setFontSize(9)
  doc.setTextColor(147, 197, 253)
  doc.text('本方案由路书制作工具自动生成，最终解释权归本社所有', pageWidth / 2, pageHeight - 8, {
    align: 'center',
  })
}

function drawHeader(doc: jsPDF, brand: BrandConfig, pageWidth: number, margin: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(30, 64, 175)
  doc.text(brand.agencyName || '星空旅行社', margin, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  const contact = `${brand.consultantName || '定制师'} | ${brand.consultantPhone || '138-0000-0000'}`
  doc.text(contact, pageWidth - margin, 12, { align: 'right' })

  doc.setDrawColor(219, 234, 254)
  doc.line(margin, 17, pageWidth - margin, 17)
}

function drawItineraryInfo(
  doc: jsPDF,
  requirement: CustomerRequirement,
  route: RoutePlan,
  margin: number
) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('一、行程概览', margin, 32)

  const infoData = [
    ['目的地', requirement.destination || '川西环线', '行程类型', route.name],
    ['出行天数', `${requirement.days}天${requirement.days - 1}晚`, '出行人数', `${requirement.peopleCount}人`],
    ['交通方式', requirement.transportType === 'rental' ? '租车自驾' : '自带车自驾', '总里程', `${route.totalDriveDistance}km`],
    ['酒店等级', getHotelLevelName(requirement.hotelLevel), '出团日期', requirement.travelDate || '待定'],
  ]

  autoTable(doc, {
    startY: 40,
    body: infoData,
    styles: { cellPadding: 5, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 25, fillColor: [239, 246, 255], textColor: [30, 64, 175], fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 25, fillColor: [239, 246, 255], textColor: [30, 64, 175], fontStyle: 'bold' },
      3: { cellWidth: 65 },
    },
    didDrawCell: () => {},
  })

  const yAfter = (doc as any).lastAutoTable.finalY + 12
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('行程亮点', margin, yAfter)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  route.highlights.forEach((h, i) => {
    doc.setFillColor(251, 191, 36)
    doc.circle(margin + 3, yAfter + 8 + i * 7, 2, 'F')
    doc.text(h, margin + 10, yAfter + 9 + i * 7)
  })
}

function drawDailyPlans(doc: jsPDF, route: RoutePlan, pageWidth: number, margin: number) {
  const startY = 160
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('二、每日行程', margin, startY)

  const bodyData: any[] = []
  route.dailyPlans.forEach(day => {
    bodyData.push([
      `第${day.day}天\n${day.driveDuration} · ${day.driveDistance}km`,
      `${day.title}\n住宿：${day.stayCity} ${day.hotelName}`,
      day.highlights.join('、'),
    ])
  })

  autoTable(doc, {
    startY: startY + 8,
    head: [['日期/车程', '行程概要', '核心体验']],
    body: bodyData,
    styles: { cellPadding: 5, fontSize: 9, valign: 'top' },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', textColor: [30, 64, 175] },
      1: { cellWidth: 70 },
      2: { cellWidth: 69 },
    },
  })
}

function drawQuoteSection(
  doc: jsPDF,
  requirement: CustomerRequirement,
  route: RoutePlan,
  config: QuoteConfig,
  quote: QuoteResult,
  margin: number
) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('三、费用说明', margin, 32)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('3.1 费用明细', margin, 44)

  const breakdownData = [
    ['酒店住宿', `${hotelLevelLabels[config.selectedHotelLevel]} × ${requirement.days - 1}晚`, `¥${quote.hotelCost.toLocaleString()}`],
    ['门票组合', config.selectedTickets.map(id => {
      const t = ticketPackages.find(x => x.id === id)
      return t ? t.name : ''
    }).filter(Boolean).join('、') || '客户自理', `¥${quote.ticketCost.toLocaleString()}`],
    ['增值服务', [
      config.includeLeader ? '专业领队' : '',
      config.includeRescue ? '救援服务' : '',
      config.includeInsurance ? '保险' : '',
      config.includeMeals ? '餐饮包' : '',
    ].filter(Boolean).join('、') || '无', `¥${quote.serviceCost.toLocaleString()}`],
    ['交通及其他', requirement.transportType === 'rental' ? '租车费用' : '车辆服务', `¥${quote.otherCost.toLocaleString()}`],
    ['计划利润', `${config.profitMargin}%`, `¥${quote.profit.toLocaleString()}`],
  ]

  autoTable(doc, {
    startY: 52,
    body: breakdownData,
    styles: { cellPadding: 5, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold', fillColor: [249, 250, 251] },
      1: { cellWidth: 100 },
      2: { cellWidth: 37, halign: 'right', fontStyle: 'bold' },
    },
  })

  const after1 = (doc as any).lastAutoTable.finalY + 8
  doc.setFillColor(239, 246, 255)
  doc.rect(margin, after1, 167, 22, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 64, 175)
  doc.text('报价区间', margin + 5, after1 + 9)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 128, 61)
  doc.text(`¥${quote.totalMin.toLocaleString()} - ¥${quote.totalMax.toLocaleString()}`, margin + 35, after1 + 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`毛利率约 ${quote.profitMargin}%`, 140, after1 + 12)

  const after2 = after1 + 32
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('3.2 费用包含项目', margin, after2)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  route.included.forEach((item, i) => {
    doc.setFillColor(34, 197, 94)
    doc.circle(margin + 3, after2 + 8 + i * 5.5, 1.5, 'F')
    doc.text(item, margin + 8, after2 + 9 + i * 5.5)
  })

  const after3 = after2 + 8 + route.included.length * 5.5 + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('3.3 费用不包含项目', margin, after3)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  route.notIncluded.forEach((item, i) => {
    doc.setFillColor(239, 68, 68)
    doc.circle(margin + 3, after3 + 8 + i * 5.5, 1.5, 'F')
    doc.text(item, margin + 8, after3 + 9 + i * 5.5)
  })

  if (quote.warnings.length > 0) {
    const after4 = after3 + 8 + route.notIncluded.length * 5.5 + 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('3.4 温馨提示', margin, after4)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(127, 29, 29)
    quote.warnings.forEach((w, i) => {
      doc.text(w, margin, after4 + 8 + i * 5.5)
    })
  }
}

function drawNotes(doc: jsPDF, margin: number, pageHeight: number) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('四、出行注意事项', margin, 32)

  const notes = [
    {
      title: '4.1 出行准备',
      items: [
        '携带本人有效身份证件、学生证、军官证等优惠证件',
        '高原地区紫外线强，请准备防晒霜、墨镜、遮阳帽',
        '昼夜温差大，建议携带冲锋衣、羽绒服等保暖衣物',
        '建议自备洗漱用品、保温杯、常用药品（感冒、肠胃药）',
        '出发前请保持良好睡眠，避免饮酒，预防高原反应',
      ],
    },
    {
      title: '4.2 安全须知',
      items: [
        '自驾行程请严格遵守交通规则，严禁疲劳驾驶',
        '高原行车注意车辆状况，每日出发前检查车辆',
        '请勿单独前往偏僻区域，保持与团队通讯畅通',
        '景区游览请走正规步道，切勿踏入未开发区域',
        '如发生身体不适或突发状况，请第一时间联系领队',
      ],
    },
    {
      title: '4.3 风俗习惯',
      items: [
        '尊重当地少数民族风俗习惯，不随意拍摄当地居民',
        '进入寺庙参观请脱帽，不戴墨镜，遵守寺内规定',
        '藏区忌用单手接递物品，接受哈达请双手承接',
        '不随意踩跨经幡、玛尼堆等宗教设施',
        '如需要购买特产纪念品，请确认价格和品质',
      ],
    },
    {
      title: '4.4 退改政策',
      items: [
        '出发前15天取消，退还全款的100%',
        '出发前7-14天取消，退还全款的70%',
        '出发前3-6天取消，退还全款的50%',
        '出发前2天内取消，不予退款',
        '行程中因个人原因取消，未产生费用可协商退还',
      ],
    },
  ]

  let currentY = 44
  notes.forEach(section => {
    if (currentY > pageHeight - 60) {
      doc.addPage()
      drawHeader(doc, {
        agencyName: '星空旅行社',
        agencyLogo: '',
        slogan: '',
        consultantName: '',
        consultantTitle: '',
        consultantPhone: '',
        consultantWechat: '',
        agencyAddress: '',
        agencyWebsite: '',
      }, doc.internal.pageSize.getWidth(), margin)
      currentY = 32
    }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 64, 175)
    doc.text(section.title, margin, currentY)
    currentY += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    section.items.forEach(item => {
      doc.setFillColor(251, 191, 36)
      doc.circle(margin + 3, currentY + 2, 1.5, 'F')
      doc.text(item, margin + 8, currentY + 3, { maxWidth: 167 })
      currentY += 6
    })
    currentY += 4
  })
}

function drawMapSection(
  doc: jsPDF,
  route: RoutePlan,
  pageWidth: number,
  margin: number,
  pageHeight: number
) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('五、行程地图', margin, 32)

  const mapX = margin
  const mapY = 42
  const mapW = pageWidth - margin * 2
  const mapH = 110

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.3)
  doc.roundedRect(mapX, mapY, mapW, mapH, 3, 3, 'S')
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2, 3, 3, 'F')

  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(1)
  const cities = route.dailyPlans.map(d => d.stayCity)
  const uniqueCities = [...new Set(cities)]

  const startX = mapX + 20
  const endX = mapX + mapW - 20
  const stepY = (mapH - 40) / Math.max(uniqueCities.length - 1, 1)
  let lastX = startX
  let lastY = mapY + 20

  uniqueCities.forEach((city, i) => {
    const x = startX + ((endX - startX) / Math.max(uniqueCities.length - 1, 1)) * i + (Math.sin(i * 2) * 10)
    const y = mapY + 20 + stepY * i
    if (i > 0) {
      doc.line(lastX, lastY, x, y)
    }
    lastX = x
    lastY = y

    doc.setFillColor(239, 68, 68)
    doc.circle(x, y, 4, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(city, x + 7, y + 2)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(`D${i + 1}`, x + 7, y + 9)
  })

  const legendY = mapY + mapH + 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('图例：', mapX, legendY + 4)
  doc.setFillColor(239, 68, 68)
  doc.circle(mapX + 18, legendY + 2, 3, 'F')
  doc.text('住宿城市', mapX + 24, legendY + 4)
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(1)
  doc.line(mapX + 55, legendY + 2, mapX + 68, legendY + 2)
  doc.text('行车路线', mapX + 72, legendY + 4)
  doc.text(`总里程：${route.totalDriveDistance}km`, mapX + mapW - 30, legendY + 4, { align: 'right' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('行程建议', margin, legendY + 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  const tips = [
    '每日出发前规划好行车路线，关注实时路况和天气预报',
    '高原地区加油站间距较大，建议油量低于半箱时及时补加',
    '沿途停车拍照请选择安全区域，勿在弯道和坡道停留',
    '导航请同时准备离线地图，部分山区可能信号不佳',
  ]
  tips.forEach((t, i) => {
    doc.setFillColor(59, 130, 246)
    doc.circle(margin + 3, legendY + 30 + i * 6, 1.5, 'F')
    doc.text(t, margin + 8, legendY + 31 + i * 6)
  })

  const signY = pageHeight - margin - 20
  doc.setDrawColor(209, 213, 219)
  doc.line(margin, signY, pageWidth - margin, signY)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('顾问签字：________________', margin, signY + 10)
  doc.text('客户确认签字：________________', pageWidth * 0.45, signY + 10)
  doc.text('日期：____________', pageWidth - margin, signY + 10, { align: 'right' })
}

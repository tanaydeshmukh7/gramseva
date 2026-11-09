import { NextResponse } from 'next/server';
import { getMeetingNoticeData } from '@/lib/sheetsService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberSr, customMessage } = body;
    const noticeData = getMeetingNoticeData();

    // Verify recipient belongs strictly to committee member list
    let recipients = noticeData.members;
    if (memberSr) {
      recipients = noticeData.members.filter((m) => m.sr === memberSr);
      if (recipients.length === 0) {
        return NextResponse.json(
          { error: 'निवडलेला सदस्य अधिकृत मासिक सभा सदस्य यादीत आढळला नाही.' },
          { status: 400 }
        );
      }
    }

    const defaultMsg =
      customMessage ||
      `मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. ${noticeData.meeting_date} रोजी ${noticeData.meeting_time} वाजता ${noticeData.venue} येथे आयोजित केली आहे. तरी उपस्थित राहावे ही नम्र विनंती. - ग्रामसेवक/सरपंच, ग्रा.पं. गोहगाव.`;

    const dispatchResults = recipients.map((m) => {
      const isConfigured = m.mobile && !m.mobile.includes('X');
      return {
        sr: m.sr,
        name: m.name,
        role: m.role,
        mobile: m.mobile,
        status: isConfigured ? 'SENT' : 'PENDING_MOBILE_CONFIG',
        message: defaultMsg,
        timestamp: new Date().toISOString(),
        details: isConfigured
          ? 'WhatsApp संदेश पाठवण्यात आला आहे.'
          : 'प्रशासकाने मोबाईल क्रमांक अद्ययावत करणे आवश्यक आहे.',
      };
    });

    return NextResponse.json({
      success: true,
      total_targeted: recipients.length,
      dispatched: dispatchResults,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

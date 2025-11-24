'use client';

export const dynamic = 'force-dynamic';

export default function LiveChatPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="text-2xl font-bold text-primary-black mb-4">Live Chat Disabled</h1>
        <p className="text-custom-gray mb-6">
          The live chat feature has been temporarily disabled.
        </p>
        <p className="text-sm text-custom-gray">
          For inquiries, please use the contact information provided on the main website.
        </p>
      </div>
    </div>
  );
}

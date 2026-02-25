import Navbar from "@/components/navbar"

export const metadata = {
    title: "Terms of Service | AI Era Academy",
    description: "Terms of Service for AI Era Academy",
}

export default function TermsOfServicePage() {
    return (
        <main className="flex flex-col min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl flex-1">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Terms of Service</h1>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using AI Era Academy (the &quot;Service&quot;), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Description of Service</h2>
                    <p>
                        AI Era Academy provides an online learning platform focused on Artificial Intelligence, Machine Learning,
                        and programming. The Service includes educational content, interactive coding environments, AI-assisted
                        tools, and a community space.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. User Accounts</h2>
                    <p>
                        To access certain features of the Service, you must create an account. You are responsible for maintaining
                        the confidentiality of your account information and for all activities that occur under your account.
                        You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Acceptable Use</h2>
                    <p>
                        You agree not to use the Service to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Violate any local, state, national, or international law.</li>
                        <li>Infringe upon the intellectual property rights of others.</li>
                        <li>Upload or transmit viruses, malware, or other malicious code.</li>
                        <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
                        <li>Scrape, datamine, or reverse-engineer the AI models or content provided.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Intellectual Property</h2>
                    <p>
                        All content on the Service, including text, graphics, logos, and software, is the property of AI Era Academy
                        or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, or
                        create derivative works based on our content without explicit permission.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Limitation of Liability</h2>
                    <p>
                        AI Era Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                        or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
                        or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at <a href="mailto:legal@aiera.academy" className="text-primary hover:underline">legal@aiera.academy</a>.
                    </p>
                </div>
            </div>

            <footer className="py-10 border-t border-border mt-auto bg-background relative z-10">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
                    <p>© 2026 AI Era Academy. All rights reserved.</p>
                </div>
            </footer>
        </main>
    )
}

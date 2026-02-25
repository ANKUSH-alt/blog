import Navbar from "@/components/navbar"

export const metadata = {
    title: "Privacy Policy | AI Era Academy",
    description: "Privacy Policy for AI Era Academy",
}

export default function PrivacyPolicyPage() {
    return (
        <main className="flex flex-col min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl flex-1">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Introduction</h2>
                    <p>
                        Welcome to AI Era Academy. We respect your privacy and are committed to protecting your personal data.
                        This Privacy Policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. The Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
                        In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, including any requests to exercise your legal rights, please contact us at <a href="mailto:privacy@aiera.academy" className="text-primary hover:underline">privacy@aiera.academy</a>.
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

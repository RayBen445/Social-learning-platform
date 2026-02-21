'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'verify' | 'welcome' | 'reset'>('verify')

  // Sample template data
  const templates = {
    verify: {
      name: 'Email Verification',
      description: 'Sent when user signs up to verify their email address',
      iframeKey: 'verify-email'
    },
    welcome: {
      name: 'Welcome Email',
      description: 'Sent after email verification to welcome user',
      iframeKey: 'welcome'
    },
    reset: {
      name: 'Password Reset',
      description: 'Sent when user requests to reset their password',
      iframeKey: 'reset-password'
    }
  }

  const currentTemplate = templates[selectedTemplate]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Email Template Preview</h1>
          <p className="text-slate-600">View and test LearnLoop transactional email templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>Available email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(templates).map(([key, template]) => (
                <Button
                  key={key}
                  variant={selectedTemplate === key ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTemplate(key as any)}
                >
                  <span className="truncate">{template.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{currentTemplate.name}</CardTitle>
                <CardDescription>{currentTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => {
                      const element = document.querySelector('iframe')
                      if (element) {
                        element.requestFullscreen()
                      }
                    }}>
                      Fullscreen
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const element = document.querySelector('iframe')
                      if (element) {
                        const html = element.contentDocument?.documentElement.innerHTML
                        if (html) {
                          const blob = new Blob([html], { type: 'text/html' })
                          const url = URL.createObjectURL(blob)
                          window.open(url)
                        }
                      }
                    }}>
                      Download HTML
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      alert('To send test emails, configure your email service provider in EMAIL_SETUP.md')
                    }}>
                      Send Test Email
                    </Button>
                  </div>

                  {/* Responsive Preview */}
                  <Tabs defaultValue="desktop" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="desktop">Desktop</TabsTrigger>
                      <TabsTrigger value="tablet">Tablet</TabsTrigger>
                      <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="desktop" className="mt-4">
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta charset="utf-8">
                            <style>
                              body { margin: 0; padding: 20px; background: #f5f5f5; font-family: system-ui; }
                              .container { max-width: 600px; margin: 0 auto; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h2>Email Preview (Desktop - 600px)</h2>
                              <p style="color: #666; font-size: 12px;">This is a preview of how the email appears on desktop email clients.</p>
                              <iframe src="/emails-preview/${currentTemplate.iframeKey}" style="width: 100%; height: 800px; border: 1px solid #ddd; border-radius: 4px; background: white; margin-top: 20px;" frameborder="0"></iframe>
                            </div>
                          </body>
                          </html>
                        `}
                        className="w-full bg-white rounded-lg border"
                        style={{ height: '1000px' }}
                      />
                    </TabsContent>

                    <TabsContent value="tablet" className="mt-4">
                      <div className="flex justify-center">
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <meta charset="utf-8">
                              <style>
                                body { margin: 0; padding: 20px; background: #f5f5f5; }
                                .tablet-frame { width: 600px; height: 800px; background: white; border: 1px solid #ddd; border-radius: 4px; }
                              </style>
                            </head>
                            <body>
                              <div class="tablet-frame">
                                <iframe src="/emails-preview/${currentTemplate.iframeKey}" style="width: 100%; height: 100%; border: none;" frameborder="0"></iframe>
                              </div>
                            </body>
                            </html>
                          `}
                          className="rounded-lg border"
                          style={{ width: '600px', height: '900px' }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="mobile" className="mt-4">
                      <div className="flex justify-center">
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <meta charset="utf-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1">
                              <style>
                                body { margin: 0; padding: 20px; background: #f5f5f5; }
                                .mobile-frame { width: 375px; height: 667px; background: white; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
                              </style>
                            </head>
                            <body>
                              <div class="mobile-frame">
                                <iframe src="/emails-preview/${currentTemplate.iframeKey}" style="width: 100%; height: 100%; border: none;" frameborder="0"></iframe>
                              </div>
                            </body>
                            </html>
                          `}
                          className="rounded-lg border"
                          style={{ width: '375px', height: '750px' }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Code View */}
                  <details className="mt-6">
                    <summary className="cursor-pointer font-semibold text-slate-900">View HTML Source</summary>
                    <pre className="mt-3 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
{`<!-- ${currentTemplate.name} -->
<!-- Template preview loading... -->`}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Setup Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>✓ Modern, responsive design</p>
                <p>✓ Works across all email clients</p>
                <p>✓ Branded with Cool Shot Systems</p>
                <p>✓ Mobile-optimized</p>
                <p>✓ Dark mode compatible</p>
                <p className="pt-2 text-blue-600">
                  For setup instructions, see <code className="bg-slate-100 px-2 py-1 rounded text-xs">EMAIL_SETUP.md</code>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Here you would typically upload to a service like Cloudinary
      // For now, we'll just return file info
      const fileInfo = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/uploads/${file.name}`, // This would be the actual URL after upload
      }

      uploadedFiles.push(fileInfo)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

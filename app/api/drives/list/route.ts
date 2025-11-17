import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    let drives = []

    // Different approach for Windows/Mac/Linux
    try {
      if (process.platform === 'win32') {
        // Windows: List drives using wmic
        const { stdout } = await execAsync('wmic logicaldisk get name')
        const driveLetters = stdout
          .split('\n')
          .slice(1)
          .map((line) => line.trim())
          .filter((line) => line && line.match(/^[A-Z]:/))

        drives = driveLetters.map((letter) => ({
          path: letter,
          name: `Drive ${letter}`,
          size: 'Unknown',
        }))
      } else if (process.platform === 'darwin') {
        // macOS: List /Volumes
        const { stdout } = await execAsync('ls /Volumes')
        drives = stdout
          .split('\n')
          .filter((line) => line && line !== 'Macintosh HD')
          .map((name) => ({
            path: `/Volumes/${name}`,
            name,
            size: 'Unknown',
          }))
      } else {
        // Linux: List /mnt
        const { stdout } = await execAsync('ls /mnt')
        drives = stdout
          .split('\n')
          .filter((line) => line)
          .map((name) => ({
            path: `/mnt/${name}`,
            name,
            size: 'Unknown',
          }))
      }
    } catch (error) {
      console.error('Drive detection error:', error)
    }

    return NextResponse.json({
      drives,
    })
  } catch (error) {
    console.error('Drive listing error:', error)
    return NextResponse.json(
      { error: 'Failed to list drives' },
      { status: 500 }
    )
  }
}

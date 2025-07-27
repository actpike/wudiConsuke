# Windows PowerShell sound player script for Claude hooks
param(
    [string]$SoundFile = "001_tsumugi_done.wav"
)

$WSLPath = "/home/actpike/dev/assets/sounds/$SoundFile"
$WindowsPath = wsl wslpath -w $WSLPath

if (Test-Path $WindowsPath) {
    Add-Type -AssemblyName System.Windows.Forms
    $player = New-Object System.Media.SoundPlayer($WindowsPath)
    $player.PlaySync()
    Write-Host "✅ Sound played: $SoundFile"
} else {
    Write-Host "❌ Sound file not found: $WindowsPath"
    exit 1
}
$ErrorActionPreference = 'Stop'
$vroot = "v2\assets\img\Videography-Page"
$out = "_build\video_out"
New-Item -ItemType Directory -Force -Path $out | Out-Null
New-Item -ItemType Directory -Force -Path "unused_assets\originals\assets\img\Videography-Page\Videos" | Out-Null
New-Item -ItemType Directory -Force -Path "unused_assets\originals\assets\img\Videography-Page\snippets" | Out-Null

$jobs = @(
  @{ file = "$vroot\Videos\Mammamia.mp4";            audio = $true },
  @{ file = "$vroot\Videos\SSIS.mp4";                audio = $true },
  @{ file = "$vroot\Videos\Suzhou Center.mp4";       audio = $true },
  @{ file = "$vroot\Videos\Suzhou Times Square.mp4"; audio = $true },
  @{ file = "$vroot\snippets\aerial-snippet.mp4";    audio = $false },
  @{ file = "$vroot\snippets\events-snippet.mp4";    audio = $false },
  @{ file = "$vroot\snippets\promotion-snippet.mp4"; audio = $false }
)

foreach ($j in $jobs) {
  $src = $j.file
  $name = Split-Path $src -Leaf
  $tmp = Join-Path $out $name
  $before = (Get-Item $src).Length
  Write-Output "encoding $name ($([math]::Round($before/1MB,1)) MB)..."

  $ff = @('-y', '-v', 'error', '-i', $src,
            '-vf', 'scale=1280:-2,fps=30',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
            '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.0',
            '-movflags', '+faststart')
  if ($j.audio) { $ff += @('-c:a','aac','-b:a','96k','-ac','2') } else { $ff += @('-an') }
  $ff += $tmp

  & ffmpeg @ff
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed on $name" }

  $after = (Get-Item $tmp).Length
  # keep the original, never delete
  $dest = Join-Path "unused_assets\originals" ($src -replace '^v2\\', '')
  Move-Item -LiteralPath $src -Destination $dest -Force
  Move-Item -LiteralPath $tmp -Destination $src -Force
  Write-Output ("  {0}: {1:N1} MB -> {2:N1} MB" -f $name, ($before/1MB), ($after/1MB))
}
Write-Output "VIDEO DONE"

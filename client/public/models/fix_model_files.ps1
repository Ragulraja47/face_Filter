# PowerShell script to download and replace model files

# Define the URLs for the raw JSON files
$urls = @{
    "tiny_face_detector_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json";
    "face_landmark_68_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json";
    "face_recognition_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json";
    "age_gender_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-weights_manifest.json"
}

# Define the target directory
$targetDir = "d:\\projects\\face_Filter\\client\\public\\models"

# Ensure the target directory exists
if (-Not (Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# Download each file
foreach ($fileName in $urls.Keys) {
    $url = $urls[$fileName]
    $targetPath = Join-Path -Path $targetDir -ChildPath $fileName

    Write-Host "Downloading $fileName from $url..."
    Invoke-WebRequest -Uri $url -OutFile $targetPath -ErrorAction Stop
    Write-Host "$fileName downloaded successfully to $targetPath."
}

Write-Host "All model files have been downloaded and replaced successfully."

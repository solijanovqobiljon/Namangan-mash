import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import logoImage from "../components/assets/logo.png"

const Banner3D = ({ showOverlay, setShowOverlay, t }) => {
  const factoryCanvasRef = useRef(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const canvas = factoryCanvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(60, 40, 60);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls - faqat mouse bilan boshqarish
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 15;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = Math.PI * 0;

    // Raycaster - binolarni click qilish uchun
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Binolarni highlight qilish funksiyasi - O'CHIRILDI
    const highlightBuilding = (building) => {
      // Rang o'zgarishini o'chirish - hech narsa qilmaymiz
    };

    // Kamerani binoga qaratish funksiyasi
    const focusCameraOnBuilding = (building) => {
      if (!building) return;

      const boundingBox = new THREE.Box3().setFromObject(building);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());

      // Binoning markaziga qaratish
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraDistance = Math.max(maxDim / (2 * Math.tan(fov / 2)) * 1.5, 20); // Minimum 20 birlik masofa

      // Kamerani binoning ustidan diagonal tomondan ko'rsatish
      const direction = new THREE.Vector3(1, 0.6, 1).normalize(); // Balandroq burchak
      const cameraPosition = new THREE.Vector3()
        .copy(center)
        .add(direction.multiplyScalar(cameraDistance));

      // Kamerani yer sathidan pastga tushmasligini ta'minlash
      cameraPosition.y = Math.max(cameraPosition.y, 10); // Minimum 10 birlik balandlik

      // Smooth animatsiya uchun
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = center.clone();
      endTarget.y += size.y * 0.3; // Binoning yuqori qismiga qaratish

      const duration = 1200; // 1.2 soniya
      const startTime = Date.now();

      const animateCamera = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // Kamerani harakatlantirish
        camera.position.lerpVectors(startPosition, cameraPosition, easeOut);
        controls.target.lerpVectors(startTarget, endTarget, easeOut);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };

      animateCamera();
    };

    // Click event handler - FAQAT FOCUS UCHUN
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes);

      if (intersects.length > 0) {
        const clickedBuilding = intersects[0].object;

        // Binoni highlight qilish - O'CHIRILDI
        // highlightBuilding(clickedBuilding);
        setSelectedBuilding(clickedBuilding.userData.name);

        // Kamerani binoga qaratish
        focusCameraOnBuilding(clickedBuilding);

      } else {
        // Hech narsa bosilmasa, highlightni olib tashlash - O'CHIRILDI
        // highlightBuilding(null);
        setSelectedBuilding(null);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Yorug'lik
    const hemi = new THREE.HemisphereLight(0xaaaaFF, 0x444466, 0.9);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    scene.add(dirLight);

    // Ichki yoritish
    const interiorLight = new THREE.PointLight(0xffffff, 1.2, 50);
    interiorLight.position.set(0, 5, 0);
    scene.add(interiorLight);

    // Yer
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.5; // Yerni biroz pastroq qo'yish
    ground.receiveShadow = true;
    scene.add(ground);

    // G'ISHTLI BINO MATERIALLARI
    const createBrickMaterial = (baseColor) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;

      const mainColor = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
      const darkColor = `rgb(${baseColor.r * 0.7}, ${baseColor.g * 0.7}, ${baseColor.b * 0.7})`;

      context.fillStyle = mainColor;
      context.fillRect(0, 0, 512, 512);

      context.strokeStyle = darkColor;
      context.lineWidth = 4;

      for (let y = 0; y < 512; y += 64) {
        context.beginPath();
        context.moveTo(0, y + Math.sin(y * 0.1) * 2);
        context.lineTo(512, y + Math.cos(y * 0.15) * 2);
        context.stroke();
      }

      for (let x = 0; x < 512; x += 128) {
        context.beginPath();
        context.moveTo(x + Math.sin(x * 0.05) * 3, 0);
        context.lineTo(x + Math.cos(x * 0.08) * 3, 512);
        context.stroke();
      }

      for (let y = 0; y < 512; y += 64) {
        for (let x = 0; x < 512; x += 128) {
          const brickVariation = Math.random() * 0.3 + 0.85;
          context.fillStyle = `rgb(
            ${Math.min(baseColor.r * brickVariation, 255)},
            ${Math.min(baseColor.g * brickVariation, 255)},
            ${Math.min(baseColor.b * brickVariation, 255)}
          )`;

          const brickWidth = 120 + Math.random() * 8;
          const brickHeight = 58 + Math.random() * 6;
          const offsetX = (x % 2 === 0) ? 0 : 64;

          context.fillRect(
            offsetX + x + 2 + Math.random() * 2,
            y + 2 + Math.random() * 2,
            brickWidth,
            brickHeight
          );

          context.strokeStyle = darkColor;
          context.lineWidth = 1;
          context.strokeRect(
            offsetX + x + 2 + Math.random() * 2,
            y + 2 + Math.random() * 2,
            brickWidth,
            brickHeight
          );
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8);

      return new THREE.MeshStandardMaterial({
        map: texture,
        color: new THREE.Color(baseColor.r / 255, baseColor.g / 255, baseColor.b / 255),
        metalness: 0.05,
        roughness: 0.9,
        transparent: false,
        opacity: 1.0
      });
    };

    // DODGER BLUE rang (1E90FF)
    const dodgerBlue = { r: 30, g: 144, b: 255 };

    // Asosiy bino materiallari - DODGER BLUE G'ISHTLI
    const mainBrickMat = createBrickMaterial(dodgerBlue);
    const leftBrickMat = createBrickMaterial(dodgerBlue); // Bir xil rang
    const rightBrickMat = createBrickMaterial(dodgerBlue); // Bir xil rang

    // KARIDOR UCHUN MATERIAL - BIR XIL RANG
    const corridorBrickMat = createBrickMaterial(dodgerBlue); // Bir xil rang

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffdd44,
      emissiveIntensity: 1.5
    });

    // ESHIK MATERIALI
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Jigarrang eshik
      metalness: 0.3,
      roughness: 0.7
    });

    // Binolar
    const buildingMeshes = [];
    const addBuilding = (pos, size, material, name, isWall = false) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { name, isWall }; // Bino nomini va devor ekanligini saqlash
      scene.add(mesh);
      buildingMeshes.push(mesh);
      return mesh;
    };

    // ════════════════════════════════════════════════════
    // "U" SHAKLIDAGI BINOLAR STRUKTURASI
    // ════════════════════════════════════════════════════

    // ASOSIY BINOLAR (old tomondagi)
    const main = addBuilding([ -5, 6, 0], [30, 12, 12], mainBrickMat, "Asosiy Bino");
    const left = addBuilding([-35, 4, -5.6], [30, 8, 1], leftBrickMat, "Chap Devor", true); // DEVOR
    const right = addBuilding([ 16.5, 4, 0 ], [13, 10, 12], rightBrickMat, "O'ng Bino");

    // ORQA BINOLAR - "U" shakl yasash uchun
    const backLeft = addBuilding([ -53.5, 3.5, -13], [9, 9, 16], leftBrickMat, "Orqa Chap");
    const backRight = addBuilding([-3.9, 5, -41], [16, 12, 42], rightBrickMat, "Orqa O'ng");
    const backCenter = addBuilding([-33, 5.5, -41], [23, 11, 42], mainBrickMat, "Orqa Markaz");

    // YANGI DEVOR - SIZNING DEVORINGIZ BILAN BIR HIL
    const newWall = addBuilding([-57.8, 4, -66], [0.5, 8, 90], leftBrickMat, "Yangi Devor", true); // DEVOR

    // YANGI 20-BINO - ORQA MARKAZ YONIGA
    const building20 = addBuilding([-16.5, 5, -41], [8, 12, 41.9], mainBrickMat, "20-Bino");

    // YANGI 15-BINO - ORQA TOMONGA (derazasiz)
    const building15 = addBuilding([-19, 5.5, -85], [40, 11, 25], mainBrickMat, "15-Bino");

    // YANGI DEVOR - newWall dan o'ng tomonga cho'zilgan
    const newWallExtension = addBuilding([23.5, 4, -111], [162.7, 8, 0.5], leftBrickMat, "Yangi Devor Uzantisi", true);

    // YANGI DEVOR - O'ng bino yoniga kaltaroq devor
    const rightWall = addBuilding([22.9, 3.5, 12], [0.5, 7, 12], leftBrickMat, "O'ng Devor", true);

    // YANGI 21-BINO - O'ng binoning yonidagi devorning oldiga ko'chirildi
    const building21 = addBuilding([27, 3.5, 26], [9, 9, 16], leftBrickMat, "21-Bino");

    // ════════════════════════════════════════════════════
    // YANGI KARIDOR BINOSI - 21-BINONING O'NG TOMONIDA, ORQA TOMONDA ESHIK BILAN
    // ════════════════════════════════════════════════════

    // Karidor binosi - 21-bino bilan bir tekisda (z o'qi bo'yicha)
    const corridor = addBuilding([35, 4, -26], [6, 8, 120], corridorBrickMat, "Karidor");

    // ════════════════════════════════════════════════════
    // YANGI 14-BINOLAR - KARIDOR CHAP TARAFIDA VA 15-BINO O'NG TARAFIDA
    // ════════════════════════════════════════════════════
    const building14Left = addBuilding([39, 4.5, -99], [39, 11, 11], mainBrickMat, "14-Bino (Karidor Chap)");
    const building14Right = addBuilding([17, 5, -87], [15, 10, 35], mainBrickMat, "14-Bino (15-O'ng)");

    // ════════════════════════════════════════════════════
    // YANGI BINOLAR - 4-RAQAMLI BINO ORQASIDA
    // ════════════════════════════════════════════════════
    const buildingBehind4_1 = addBuilding([52, 2, -66], [13, 16, 18], mainBrickMat, "4-Orqa Bino 1");
    const buildingBehind4_2 = addBuilding([52, 2, -84.5], [13, 16, 18], mainBrickMat, "4-Orqa Bino 2");

    // ════════════════════════════════════════════════════
    // YANGI BINOLAR - 11-RAQAMLI BINO OLDIDA 4TA BINO
    // ════════════════════════════════════════════════════
    const buildingFront11_1 = addBuilding([52, 2, -45], [13, 16, 18], mainBrickMat, "11-Old Bino 1");
    const buildingFront11_2 = addBuilding([59.9, 2, -32.2], [29, 16, 7], mainBrickMat, "11-Old Bino 2");
    const buildingFront11_3 = addBuilding([66.6, 2, -39.5], [15.7, 16, 7], mainBrickMat, "11-Old Bino 3");
    const buildingFront11_4 = addBuilding([71, 2, -48.4], [7, 16, 11], mainBrickMat, "11-Old Bino 4");

    // 6-SONLI BINO - YERNI KO'TARDIK VA BALANDLIGINI OSHIRDIK
    const buildingFront11_5 = addBuilding([59.9, 4, -1], [29, 16, 38], mainBrickMat, "6-Bino");

    const buildingFront11_6 = addBuilding([89.9, 2, 14.3], [15, 16, 38], mainBrickMat, "11-Old Bino 4");

    // ════════════════════════════════════════════════════
    // YANGI BINOLAR - 7-RAQAMLI BINO ORQASIDA 3TA BINO
    // ════════════════════════════════════════════════════
    const buildingBehind7_1 = addBuilding([92, 4, -30], [12, 7, 7], mainBrickMat, "7-Orqa Bino 1");
    const buildingBehind7_2 = addBuilding([86.6, 4, -40], [15.7, 7, 7], mainBrickMat, "7-Orqa Bino 2");
    const buildingBehind7_3 = addBuilding([73, 4, -70], [13.7, 7, 13.7], mainBrickMat, "7-Orqa Bino 3");

    // ════════════════════════════════════════════════════
    // YANGI BINOLAR - 9-RAQAMLI BINO YONIDA 2TA BINO
    // ════════════════════════════════════════════════════
    const buildingNext9_1 = addBuilding([88, 4, -68], [12, 7, 10], mainBrickMat, "9-Yon Bino 1");
    const buildingNext9_2 = addBuilding([88, 4, -88], [19, 7, 12], mainBrickMat, "9-Yon Bino 2");

    const newWallExtension2 = addBuilding([71.5, 2, 33.8], [67, 12, 0.5], leftBrickMat, "yuzaki devor", true);
    const newWallExtension3 = addBuilding([105, 2, -39], [0.5, 12, 145], leftBrickMat, "O'ng devor ", true);

    // KARIDORGA ESHIK QO'SHISH - ORQA TOMONGA (21-bino tomonga)
    const addDoorToCorridor = () => {
      const doorWidth = 1.2;
      const doorHeight = 2.5;
      const doorThickness = 0.1;

      const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
      const doorMesh = new THREE.Mesh(doorGeometry, doorMat);

      // Eshikni karidorning ORQA TOMONIGA (21-bino tomonga) joylashtirish
      doorMesh.position.set(
        33, // karidor markazi
        1.5, // yer sathidan balandlik
        34 // karidorning orqa chekkasi (21-bino tomonga)
      );

      // Eshikni 21-bino tomonga qaratish (orqa tomonga)
      doorMesh.rotation.y = 0; // 0 gradus - orqa tomonga qaragan

      doorMesh.castShadow = true;
      doorMesh.receiveShadow = true;
      scene.add(doorMesh);

      return doorMesh;
    };

    const corridorDoor = addDoorToCorridor();

    // HOVLI o'rtada bo'sh qoladi

    // BINOLAR USTIGA TEXT QO'SHISH - FAQAT BINOLAR UCHUN (DEVORLAR UCHUN EMAS)
    const createBuildingText = (textUz, textRu, position, rotation = [0, 0, 0]) => {
      // Canvas orqali text yaratish
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;

      // Orqa fon - gradient bilan tayoqcha effekti
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.95)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Tayoqcha chegarasi - qalinroq
      context.strokeStyle = '#ffffff';
      context.lineWidth = 3;
      context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Ichki chegaralar
      context.strokeStyle = '#cccccc';
      context.lineWidth = 1;
      context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Text
      context.font = 'bold 42px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#ffffff';
      context.shadowColor = 'rgba(0, 0, 0, 0.8)';
      context.shadowBlur = 4;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Tilga qarab text
      const currentText = document.documentElement.lang === 'ru' ? textRu : textUz;
      context.fillText(currentText, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });

      const geometry = new THREE.PlaneGeometry(8, 2);
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(...position);
      textMesh.rotation.set(...rotation);

      // TAYOQCHA (pole) yaratish - TIK HOLATDA
      const poleGeometry = new THREE.CylinderGeometry(0.08, 0.12, 3, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.4,
        roughness: 0.6
      });

      const pole = new THREE.Mesh(poleGeometry, poleMaterial);

      // Tayoqchani text ostiga joylashtirish - TIK HOLATDA
      pole.position.set(
        position[0],
        position[1] - 1.8, // Textdan pastroq, lekin tik
        position[2]
      );

      scene.add(pole);
      scene.add(textMesh);
      return { textMesh, pole };
    };

    // Text va tayoqchalarni kamera bilan aylantirish funksiyasi
    const updateTextRotation = () => {
      textMeshes.forEach(item => {
        if (item.textMesh) {
          // Textni kamera tomon qaratish
          const textPosition = item.textMesh.position.clone();
          const cameraPosition = camera.position.clone();

          const direction = new THREE.Vector3()
            .subVectors(cameraPosition, textPosition)
            .normalize();

          item.textMesh.lookAt(
            textPosition.x + direction.x,
            textPosition.y + direction.y,
            textPosition.z + direction.z
          );

          // Tayoqchani text bilan birga harakatlantirish
          if (item.pole) {
            const textWorldPos = new THREE.Vector3();
            item.textMesh.getWorldPosition(textWorldPos);

            item.pole.position.set(
              textWorldPos.x,
              textWorldPos.y - 1.8,
              textWorldPos.z
            );
            item.pole.rotation.set(0, 0, 0); // Tik holatda saqlash
          }
        }
      });
    };

    // Binolar ustiga text va tayoqchalar qo'shish - FAQAT BINOLAR UCHUN (DEVORLAR UCHUN EMAS)
    const textMeshes = [];

    // Asosiy binolar textlari - CHIROYLI NOMLAR
    textMeshes.push(createBuildingText(
      'ASOSIY BINO', 'ГЛАВНОЕ ЗДАНИЕ',
      [-4, 15, 0], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      'O\'NG BINO', 'ПРАВОЕ ЗДАНИЕ',
      [16, 11, 0], [0, 0, 0]
    ));

    // Orqa binolar textlari - CHIROYLI NOMLAR
    textMeshes.push(createBuildingText(
      '13-SONLI BINO', 'ЗДАНИЕ №13',
      [-55, 11, -13], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      'ORQA O\'NG BINO', 'ЗАДНЕЕ ПРАВОЕ ЗДАНИЕ',
      [-3, 13.5, -40], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      'ORQA MARKAZ', 'ЗАДНИЙ ЦЕНТР',
      [-35, 14, -35], [0, 0, 0]
    ));

    // YANGI 20-BINO UCHUN TEXT - CHIROYLI NOM
    textMeshes.push(createBuildingText(
      '20-SONLI BINO', 'ЗДАНИЕ №20',
      [-17, 13, -40], [0, 0, 0]
    ));

    // YANGI 15-BINO UCHUN TEXT - CHIROYLI NOM
    textMeshes.push(createBuildingText(
      '15-SONLI BINO', 'ЗДАНИЕ №15',
      [-15, 13, -85], [0, 0, 0]
    ));

    // YANGI 21-BINO UCHUN TEXT - CHIROYLI NOM
    textMeshes.push(createBuildingText(
      '21-SONLI BINO', 'ЗДАНИЕ №21',
      [27, 11, 26], [0, 0, 0]
    ));

    // YANGI KARIDOR UCHUN TEXT - Karidor ustiga
    textMeshes.push(createBuildingText(
      'KARIDOR', 'КОРИДОР',
      [36, 11, 18], [0, 0, 0]
    ));

    // YANGI 14-BINOLAR UCHUN TEXT - CHIROYLI NOMLAR
    textMeshes.push(createBuildingText(
      '4-SONLI BINO', 'ЗДАНИЕ №4',
      [48, 13, -100], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '14-SONLI BINO', 'ЗДАНИЕ №14',
      [17, 12, -85], [0, 0, 0]
    ));

    // YANGI ORQA BINOLAR UCHUN TEXT - CHIROYLI NOMLAR
    textMeshes.push(createBuildingText(
      '11-SONLI BINO', 'ЗДАНИЕ №11',
      [52, 13, -65], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '5-SONLI BINO', 'ЗДАНИЕ №5',
      [52, 13, -45], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '12-SONLI BINO', 'ЗДАНИЕ №12',
      [62, 13, -32], [0, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '7-SONLI BINO', 'ЗДАНИЕ №7',
      [70, 13, -40], [0, 0, 0]
    ));

    // 6-SONLI BINO TEXTINI YANGILADIK - BALANDROQ JOYLASHTIRDIK
    textMeshes.push(createBuildingText(
      '6-SONLI BINO', 'ЗДАНИЕ №6',
      [58, 17, 0], [0, 0, 0] // Y pozitsiyasini 13 dan 17 ga oshirdik
    ));

    textMeshes.push(createBuildingText(
      '3-SONLI BINO', 'ЗДАНИЕ №3',
      [90, 13, 18], [20, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '17-SONLI BINO', 'ЗДАНИЕ №17',
      [93, 10, -30], [20, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '19-SONLI BINO', 'ЗДАНИЕ №19',
      [86, 10, -40], [20, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '9-SONLI BINO', 'ЗДАНИЕ №9',
      [73, 10, -69], [20, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '10-SONLI BINO', 'ЗДАНИЕ №10',
      [88, 10, -69], [20, 0, 0]
    ));

    textMeshes.push(createBuildingText(
      '8-SONLI BINO', 'ЗДАНИЕ №8',
      [88, 10, -88], [20, 0, 0]
    ));

    // Derazalar - YANGI: TANLANGAN BINOLARGA MARKAZDA CHIROYLI DEREZALAR
    const winGeo = new THREE.BoxGeometry(1.8, 1.8, 0.3);

    // Deraza qo'shiladigan binolar ro'yxati - ORQA O'NG, 14, 6, 10, 8 qo'shildi
    const buildingsWithWindows = [
      main, right, backCenter, buildingFront11_1, // Oldingi tanlanganlar
      backRight, // Orqa O'ng bino
      building14Right, // 14-sonli bino
      buildingFront11_5, // 6-sonli bino (buildingFront11_5 nomi bilan)
      buildingNext9_1, // 10-sonli bino
      buildingNext9_2  // 8-sonli bino
    ];

    buildingsWithWindows.forEach(building => {
      const size = building.geometry.parameters;
      const w = size.width;
      const h = size.height;
      const d = size.depth;

      // ASOSIY BINO DEREZALARINI PASTROQQA TUSHURISH
      if (building === main) {
        const cols = Math.max(2, Math.floor(w / 5));
        const rows = Math.max(2, Math.floor(h / 4));

        const startX = -w/2 + (w - (cols * 3.5)) / 2 + 1.75;
        const startY = -h/2 + (h - (rows * 3)) / 2 + 0.8; // 1.5 dan 0.8 ga tushirdik - PASTROQ

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(
              building.position.x + startX + c * 3.5,
              building.position.y + startY + r * 3,
              building.position.z + d / 2 + 0.2
            );
            scene.add(win);
          }
        }
      }
      // 6-SONLI BINO UCHUN KO'PROQ DEREZA
      else if (building === buildingFront11_5) {
        // 6-sonli bino uchun ko'proq deraza
        const cols = Math.max(4, Math.floor(w / 4)); // Ko'proq ustunlar
        const rows = Math.max(3, Math.floor(h / 3.5)); // Ko'proq qatorlar

        const startX = -w/2 + (w - (cols * 3.5)) / 2 + 1.75;
        const startY = -h/2 + (h - (rows * 3)) / 2 + 1.5;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(
              building.position.x + startX + c * 3.5,
              building.position.y + startY + r * 3,
              building.position.z + d / 2 + 0.2
            );
            scene.add(win);
          }
        }
      } else {
        // Boshqa binolar uchun oddiy derazalar
        const cols = Math.max(2, Math.floor(w / 5));
        const rows = Math.max(2, Math.floor(h / 4));

        const startX = -w/2 + (w - (cols * 3.5)) / 2 + 1.75;
        const startY = -h/2 + (h - (rows * 3)) / 2 + 1.5;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(
              building.position.x + startX + c * 3.5,
              building.position.y + startY + r * 3,
              building.position.z + d / 2 + 0.2
            );
            scene.add(win);
          }
        }
      }
    });

    // Qolgan binolarga deraza qo'shilmaydi
    buildingMeshes.forEach(building => {
      if (buildingsWithWindows.includes(building)) return; // Tanlangan binolarga yuqorida qo'shildi

      // Deraza qo'shilmaydigan binolar ro'yxati
      const noWindowBuildings = [left, newWall, building20, building15, newWallExtension, rightWall,
        building21, corridor, building14Left, buildingBehind4_1, buildingBehind4_2,
        buildingFront11_2, buildingFront11_3, buildingFront11_4, buildingFront11_6,
        newWallExtension2, newWallExtension3, buildingBehind7_1, buildingBehind7_2, buildingBehind7_3,
        backLeft];

      if (noWindowBuildings.includes(building)) return;
    });

    // LOGO RASMI QO'SHILDI - YANGILANDI
    const createLogo = () => {
      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(logoImage, (texture) => {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        // LOGO HAJMINI KICHRAYTIRDIK
        const logoWidth = 2.5; // 4 dan 2.5 ga
        const logoHeight = 1.8; // 3 dan 1.8 ga

        const geometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
        const logoMesh = new THREE.Mesh(geometry, material);

        // LOGONI CHAPROQQA VA OZGINA PASTROQQA SURDIK
        logoMesh.position.set(-12, 10.8, 6.2); // X: -12 dan -14 ga, Y: 10.8 dan 9.5 ga
        logoMesh.rotation.x = -0.1;

        scene.add(logoMesh);

        // "NAMANGANMASH" texti - YANGILANDI
        const createTextBanner = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 600;
          canvas.height = 120;

          context.clearRect(0, 0, canvas.width, canvas.height);

          context.font = 'bold 48px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';

          // LOGO RANGI BILAN BIR XIL RANG - DODGER BLUE (#1E90FF)
          context.fillStyle = '#0405F1'; // 30, 144, 255 - dodgerBlue
          context.shadowColor = 'rgba(0, 0, 0, 0.5)';
          context.shadowBlur = 6;
          context.shadowOffsetX = 3;
          context.shadowOffsetY = 3;

          // "NAMANGAN MASH" O'RNIGA "NAMANGANMASH" - BIR QATORDA
          context.fillText('NAMANGANMASH', canvas.width / 2, canvas.height / 2);

          const textTexture = new THREE.CanvasTexture(canvas);
          const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            side: THREE.DoubleSide
          });

          // TEXT HAJMINI KICHRAYTIRDIK
          const textGeometry = new THREE.PlaneGeometry(16, 3); // 20,4 dan 16,3 ga
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          // TEXTNI LOGO YONIGA VA OZGINA PASTROQQA SURDIK
          textMesh.position.set(-5, 10.6, 6.2); // X: -3 dan -8 ga, Y: 10.5 dan 9.3 ga
          textMesh.rotation.x = -0.1;

          scene.add(textMesh);
        };

        createTextBanner();
      });
    };

    createLogo();

    // Animatsiya
    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      const delta = clock.getDelta();
      controls.update();

      // Text va tayoqchalarni kamera bilan aylantirish
      updateTextRotation();

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const resize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(frame);
      renderer.dispose();
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="relative min-h-[83vh] bg-gradient-to-b from-[#222] to-[#4545DA] overflow-hidden">
      <canvas ref={factoryCanvasRef} className="absolute inset-0 w-full h-full" />

      {/* Tanlangan bino ko'rsatkich */}
      {selectedBuilding && (
        <div className="absolute top-6 left-6 z-40 bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-white/30">
          <p className="text-lg font-medium">
            {t("Tanlangan: ", "Выбрано: ")}
            <span className="text-blue-400">{selectedBuilding}</span>
          </p>
        </div>
      )}

      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-40">
          <div className="text-center px-6">
          <div className='flex items-center justify-center'>
              <img src={logoImage} className='mt-[-47px] w-[86px] max-sm:w-14' alt="Logo"/>
              <h2 className="text-5xl sm:text-[60px] font-bold text-[#0003F7] border-b-4 border-[#0105ED] mb-12 drop-shadow-2xl max-sm:text-[30px]">
                NAMANGANMASH
              </h2>
            </div>

            <button
              onClick={() => setShowOverlay(false)}
              className="px-16 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-2xl font-bold sm:px-8 sm:text-[18px] sm:py-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 max-sm:px-5 max-sm:text-[13px] max-sm:py-3"
            >
              {t("3D Zavodni ko'rish", "Посмотреть 3D завод")}
            </button>
          </div>
        </div>
      )}

      {/* Yopish tugmasi */}
      {!showOverlay && (
        <button
          onClick={() => setShowOverlay(true)}
          className="absolute right-6 top-6 max-sm:px-5 max-sm:py-2 max-sm:text-[15px] z-40 bg-black/50 backdrop-blur-md text-white px-8 py-4 rounded-full border border-white/40 hover:bg-white hover:text-black transition-all text-lg font-medium"
        >
          {t("3Dni tark etish", "Покидая 3D")}
        </button>
      )}
    </div>
  );
};

export default Banner3D;

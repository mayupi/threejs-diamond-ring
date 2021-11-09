/*
 * author: 行歌
*/

import Env from './env'
import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader'

export default class Ring {

  constructor() {
    this.env = new Env()
    this.pane = this.env.pane
    this.scene = this.env.scene
    this.camera = this.env.camera
    this.renderer = this.env.renderer
    this.controls = this.env.controls
    //this._createLights()
    this._createPath()
    this._setConfig()
    this._loadEnvmap()
  }

  _createPath() {
    let curve1 = new THREE.QuadraticBezierCurve3(
      this.camera.position,
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(
        this.camera.position.x, 
        -2,
        -5
      )
    )
    let path1 = curve1.getPoints(10)

    let curve2 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(-10, 5, 0),
      new THREE.Vector3(
        0, 
        3,
        -3
      )
    )
    let path2 = curve2.getPoints(10)

    this.paths = []
    this.paths.push({
      path: path1,
      lookAt: new THREE.Vector3()
    })

    this.paths.push({
      path: path2,
      lookAt: new THREE.Vector3(0, 2, 0)
    })
      
    // const points = curve2.getPoints( 50 )
    // const geometry = new THREE.BufferGeometry().setFromPoints( points )
    // const material = new THREE.LineBasicMaterial( { color : 0xff0000 } )
    // const curveObject = new THREE.Line( geometry, material )
    // this.scene.add(curveObject)
  }

  _setConfig() {

    this.pane.addFolder({
      title: 'glass parameters'
    })

    this.params = {
      transmission: 1,
      roughness: 0.1,
      metalness: 0.35,
      thickness: 3,
      clearcoat: 1,
      envMapIntensity: 10,
      clearcoatNormalScale: 1,
      clearcoatRoughness: 0,
      normalRepeat: 0
    }

    this.pane.addInput(this.params, 'transmission',  {
      min: 0,
      max: 1,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.transmission = e.value
    })

    this.pane.addInput(this.params, 'roughness',  {
      min: 0,
      max: 1,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.roughness = e.value
    })

    this.pane.addInput(this.params, 'thickness',  {
      min: 1,
      max: 5,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.thickness = e.value
    })

    this.pane.addInput(this.params, 'metalness',  {
      min: 0,
      max: 1,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.metalness = e.value
    })

    this.pane.addInput(this.params, 'envMapIntensity',  {
      min: 1,
      max: 20,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.envMapIntensity = e.value
    })

    this.pane.addInput(this.params, 'clearcoat',  {
      min: 0,
      max: 1,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.clearcoat = e.value
    })

    this.pane.addInput(this.params, 'clearcoatNormalScale',  {
      min: 1,
      max: 3,
      step: 0.1
    }).on('change', e => {
      this.glassMaterial.clearcoatNormalScale.set(e.value, e.value)
    })

    this.pane.addInput(this.params, 'clearcoatRoughness',  {
      min: 0,
      max: 1,
      step: 0.01
    }).on('change', e => {
      this.glassMaterial.clearcoatRoughness = e.value
    })

    this.pane.addInput(this.params, 'normalRepeat',  {
      min: 0,
      max: 100,
      step: 1
    }).on('change', e => {
      this.glassMaterial.normalMap.repeat.set(e.value, e.value)
    })

    this.pane.addFolder({
      title: 'camera animations'
    })

    const btn1 = this.pane.addButton({
      title: 'play animation1'
    }).on('click', e => {
      this._playAnimation(1)
    })
    const btn2 = this.pane.addButton({
      title: 'play animation2'
    }).on('click', e => {
      this._playAnimation(2)
    })
  }

  _playAnimation(id) {
    this.camera.position.set(3, 5, 6)
    this.camera.lookAt(new THREE.Vector3())
    const path = this.paths[id-1].path
    const lookAt = this.paths[id-1].lookAt
    for(let i = 0; i < path.length; i++) {
      const point = path[i]
      gsap.to(this.camera.position, {
        x: point.x,
        y: point.y,
        z: point.z,
        duration: 1.2,
        onUpdate: () => {
          this.camera.lookAt(lookAt)
          this.controls.target.copy(lookAt)
        }
      })
    }
 
  }

  _createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    this.scene.add(dirLight)

    const light1 = new THREE.PointLight(0xffffff, 0.1, 2, 1)
    light1.position.set(0, 2, -1)
    this.scene.add(light1)

    const light2 = new THREE.PointLight(0xffffff, 0.2, 2, 1)
    light2.position.set(0, -2, 1)
    this.scene.add(light2)

    const light3 = new THREE.PointLight(0xffffff, 0.2, 2, 1)
    light3.position.set(2, -2, 1)
    this.scene.add(light3)
    
  }

  _loadEnvmap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
		pmremGenerator.compileCubemapShader()
    const hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ]
    const hdrCubeMap = new HDRCubeTextureLoader()
      .setPath( 'textures/hdr/' )
      .setDataType( THREE.UnsignedByteType )
      .load( hdrUrls, () => {
        this.hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap)
        hdrCubeMap.magFilter = THREE.LinearFilter
        hdrCubeMap.needsUpdate = true
        this._loadModel()
    })

  }

  _loadModel() {
    this.metalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x000000,
      envMap: this.hdrCubeRenderTarget.texture
    })

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      normalMap: normalTexture,
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      clearcoat: this.params.clearCoat,
      clearcoatNormalMap: normalTexture,
      clearcoatNormalScale: new THREE.Vector2(this.params.clearcoatNormalScale),
      clearcoatRoughness: this.params.clearcoatRoughness,
      emissive: 0x000000,
      transmission: this.params.transmission,
      thickness: this.params.thickness,
      envMap: this.hdrCubeRenderTarget.texture,
      envMapIntensity: this.params.envMapIntensity,
    })

            
    const normalTexture = new THREE.TextureLoader().load('textures/normal.jpg')
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(this.params.normalRepeat, this.params.normalRepeat)

    const loader = new GLTFLoader()
    loader.load('models/ring.glb', gltf => {
      gltf.scene.traverse(child => {
        if(child.name == 'Prongs' || child.name == 'handle') {
          //metal material
          child.material = this.metalMaterial
        } else {
          //glass material
          child.material = this.glassMaterial
        }
      })
      this.scene.add(gltf.scene)
    })
  }
 
}
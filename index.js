if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
}



let compiler
let optimize = 1
let compiledContract

window.onload = function () {
  document.getElementById('versions').onchange = loadSolcVersion

  if (!BrowserSolc) {
    console.log('You have to load browser-solc.js in the page. We recommend using a <script> tag.')
    throw new Error()
  }

  status('Loading Compiler Versions...')

  BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
    populateVersions(soljsonSources)
    setVersion(soljsonReleases['0.4.18'])
    loadSolcVersion()
  })
}

function loadSolcVersion() {
  status(`Loading Solc: ${getVersion()}`)
  BrowserSolc.loadVersion(getVersion(), function (c) {
    status('Solc loaded.')
    compiler = c
  })
}

function getVersion() {
  return document.getElementById('versions').value
}

function setVersion(version) {
  document.getElementById('versions').value = version
}

function populateVersions(versions) {
  sel = document.getElementById('versions')
  sel.innerHTML = ''

  for (let i = 0; i < versions.length; i++) {
    let opt = document.createElement('option')
    opt.appendChild(document.createTextNode(versions[i]))
    opt.value = versions[i]
    sel.appendChild(opt)
  }
}

function status(txt) {
  document.getElementById('status').innerHTML = txt
}

function addCompileEvent() {
  const compileBtn = document.getElementById('contract-compile')
  compileBtn.addEventListener('click', solcCompile)
}

function solcCompile() {
  if (!compiler) return alert('Please select a compiler version.')

  setCompileButtonState(true)
  status("Compiling contract...")
  compiledContract = compiler.compile(getSourceCode(), optimize)

  if (compiledContract) setCompileButtonState(false)

  console.log('Compiled Contract :: ==>', compiledContract)
  status("Compile Complete.")
}

function getSourceCode() {
  return document.getElementById("source").value
}

function setCompileButtonState(state) {
  document.getElementById("contract-compile").disabled = state
}

function getAccounts() {
  const ethAccount = web3.eth.accounts[0]

  return document
    .getElementById('account-addresses')
    .innerHTML = `<div>
        Account: ${ethAccount}
        <br />
        Balance: ${balanceInEth(ethAccount)}
      </div>
    `
}

function balanceInEth(address) {
  return web3.fromWei(web3.eth.getBalance(address).toString(), 'ether')
}

function renderContractList() {
  const contractListContainer = document.getElementById('contract-list')
  const { contracts } = compiledContract

  Object.keys(contracts).forEach((contract, index) => {
    const label = `contract-id-${contract}-${Math.random()}`
    const gas = contracts[contract].gasEstimates.creation

    createContractInfo(gas, contract, label, function (el) {
      contractListContainer.appendChild(el)
      const btnContainer = document.getElementById(label)

      btnContainer.appendChild(
        buttonFactory('primary', contract, contracts[contract], 'details')
      )

      btnContainer.appendChild(
        buttonFactory('danger', contract, contracts[contract], 'deploy')
      )
    })
  })
}

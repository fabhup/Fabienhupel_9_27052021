import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import { screen } from "@testing-library/dom"
import { ROUTES_PATH, ROUTES } from "../constants/routes"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import firebase from "../__mocks__/firebase";
import firestore from "../app/Firestore";
import { formatDateForSort } from "../app/format.js"


const pathname = ROUTES_PATH["Bills"];


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = '<div id="root"></div>';
      firestore.bills = () => firebase
      Router()
      expect(screen.getByTestId('icon-window').classList.contains("active-icon")).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills.sort((a,b) => formatDateForSort(a.date) > formatDateForSort(b.date) ? -1 : 1)})
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe('When I am on Bills page and I click on an icon eye', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(bill.handleClickIconEye)
      const eyes = screen.getAllByTestId('icon-eye')
      eyes.forEach(eye => eye.addEventListener('click', handleClickIconEye(eye)))
      eyes.forEach(eye => {
        userEvent.click(eye)
        const modale = screen.getByTestId('modaleFile')
        expect(modale).toBeTruthy()
      })
      expect(handleClickIconEye).toHaveBeenCalledTimes(4)
    })
  })

  describe('When I am on Bills page and I click on new Bill button', () => {
    test('Then, It should renders NewBill page', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId("btn-new-bill")

      buttonNewBill.addEventListener("click", handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })


// test d'intégration GET
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      const userEmail = "a@a"
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.filter(bill => bill.email === userEmail).length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

  

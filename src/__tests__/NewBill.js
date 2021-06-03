import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen } from "@testing-library/dom"
import Router from "../app/Router.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase";
import firestore from "../app/Firestore";

import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"

import NewBill from "../containers/NewBill.js"

const pathname = ROUTES_PATH["NewBill"];

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = '<div id="root"></div>';
      Router()
      expect(screen.getByTestId('icon-mail').classList.contains("active-icon")).toBeTruthy();
    })
  })

  describe('When I am on NewBill page and I change input file', () => {
    test('The file is added to input file', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html

      const firestore = null
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)

      const inputFile = screen.getByTestId("file")
      const fileName = "test.jpeg"
      const newFile = new File([fileName], fileName, {type : 'image/jpeg'})

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [newFile] } })

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe(fileName);
    })
  })

  describe("When I am on NewBill page and I click on submit NewBill", () => {
    test("a new bill have to be created", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = NewBillUI()
      document.body.innerHTML = html

      const firestore = null
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })

    test("It should renders Bills page", () => {
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })
    
    // test d'intégration POST
    test("fetches bills to mock API POST", async () => {
      const postSpy = jest.spyOn(firebase, "post")
      const bill = {
        "id": "rbBE2SgECmaZAGRrHkbD", 
        "status": "refused",
        "pct": 20,
        "amount": 100,
        "email": "johndoe@email.com",
        "name": "test post",
        "vat": "40",
        "fileName": "test.jpg",
        "date": "2021-06-03",
        "commentAdmin": "test",
        "commentary": "test",
        "type": "Transports",
      }
      const bills = await firebase.post(bill)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)
    })
    test("post new bill to an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("post new bill to an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

})
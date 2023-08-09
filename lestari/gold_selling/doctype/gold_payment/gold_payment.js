// Copyright (c) 2022, DAS and contributors
// For license information, please see license.txt

var isButtonClicked = false;
var isButtonClicked1 = false;
function run_writeoff_sisa(frm){
	if(frm.doc.unallocated_payment>0){
		frm.doc.write_off=frm.doc.write_off-frm.doc.unallocated_payment;
		frm.doc.unallocated_payment=0;
		refresh_field("write_off");
		refresh_field("unallocated_payment");
	}
	if(frm.doc.unallocated_idr_payment>0){
		frm.doc.write_off_idr=frm.doc.write_off_idr-frm.doc.unallocated_idr_payment;
		frm.doc.unallocated_idr_payment=0;
		refresh_field("write_off_idr");
		refresh_field("unallocated_idr_payment");
	}
/*	if (frm.doc.total_sisa_invoice>0.1){
		if(frm.doc.total_sisa_invoice>0.1){
			frappe.msgprint("Penghapusan Sisa Invoice Melebihi 0.1 Gram Emas di lakukan apabila document ini di submit")
		}
		frm.doc.write_off=frm.doc.write_off+frm.doc.total_sisa_invoice;
		refresh_field("total_sisa_invoice");
	}*/
	frm.doc.write_off_total=(frm.doc.write_off*frm.doc.tutupan)+frm.doc.write_off_idr;
	refresh_field("write_off_total");
	refresh_total_and_charges(frm);
}
//tax allocated itu di pisah tp kalo un allocated based on mata uang...
function calculate_table_invoice(frm,cdt,cdn){
	var total=0;
	var total_pajak=0;
	$.each(frm.doc.invoice_table,  function(i,  g) {
		total=total+g.outstanding;
		total_pajak=g.outstanding_tax;
	});
	$.each(frm.doc.customer_return,  function(i,  g) {
		total=total+g.outstanding;
	});
	frm.doc.total_pajak=total_pajak;
	frm.doc.total_invoice=total;
	refresh_field("total_pajak");
	refresh_field("total_invoice");
	//frappe.model.set_value(cdt, cdn,"allocated",0);
	frm.doc.discount_amount=frm.doc.bruto_discount/100*frm.doc.discount;
	refresh_field("discount_amount");
}
function calculate_table_invoice_alo(frm,cdt,cdn){
	var allocated=0;
	var tax_allocated=0;
	$.each(frm.doc.invoice_table,  function(i,  g) {
		allocated=allocated+g.allocated;
		tax_allocated=g.tax_allocated;
	});
	$.each(frm.doc.customer_return,  function(i,  g) {
		allocated=allocated+g.allocated;
	});
	frm.doc.allocated_idr_payment=tax_allocated;
	frm.doc.allocated_payment=allocated ;
	/*frm.doc.unallocated_payment=frm.doc.total_gold_payment + frm.doc.total_gold -frm.doc.allocated_payment;
	frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment - tax_allocated + frm.doc.total_idr_advance;
	if (frm.doc.unallocated_payment < 0 && frm.doc.unallocated_idr_payment>0){
		var nilai_kelebihan_idr = frm.doc.unallocated_idr_payment / frm.doc.tutupan;
		frm.doc.unallocated_payment = frm.doc.unallocated_payment + nilai_kelebihan_idr;
		if (frm.doc.unallocated_payment ==0){
			frm.doc.unallocated_idr_payment= frm.doc.unallocated_payment * frm.doc.tutupan;
			frm.doc.unallocated_payment=0;
		}else if (frm.doc.unallocated_payment >0){
			frm.doc.unallocated_idr_payment= frm.doc.unallocated_payment * frm.doc.tutupan;
			frm.doc.unallocated_payment=0;
		}
	}*/
	refresh_field("allocated_payment");
	/*refresh_field("unallocated_idr_payment");
	refresh_field("unallocated_payment");*/
	refresh_field("allocated_idr_payment");
	//refresh_field("discount_amount");
	//frappe.msgprint("invoice table reloaded");
}
function refresh_total_and_charges(frm){
	frm.doc.total_extra_charges=Math.floor((frm.doc.write_off+ frm.doc.total_biaya_tambahan - frm.doc.bonus - frm.doc.discount_amount)*1000)/1000;
	refresh_field("total_extra_charges");
	if (frm.doc.allocated_payment>0){
		if (frm.doc.allocated_payment>frm.doc.total_extra_charges){
			frm.doc.total_sisa_invoice=frm.doc.total_invoice - frm.doc.allocated_payment;
		}else{
			frm.doc.total_sisa_invoice=frm.doc.total_invoice + frm.doc.total_extra_charges - frm.doc.allocated_payment;
		}
	}else{
		frm.doc.total_sisa_invoice=frm.doc.total_invoice + frm.doc.total_extra_charges;
	}
	if (frm.doc.total_sisa_invoice <0 ){
		frm.doc.total_sisa_invoice=0;
	}
	refresh_field("total_sisa_invoice");
}

function calculate_stock_return(frm,cdt,cdn){
	var amount = 0;
	var total = 0;
	$.each(frm.doc.stock_return_transfer,  function(i,  g) {
		amount += g.rate * g.bruto / 100;
		g.amount = g.rate * g.bruto / 100;
		total += amount;
	})
	frm.doc.total_24k_return = total;
	frm.refresh_field("total_24k_return")	
	frm.refresh_field("stock_return_transfer")	
}
function reset_allocated(frm){
	$.each(frm.doc.invoice_table,  function(i,  g) {
		g.allocated=0;
		g.tax_allocated=0;
		frappe.model.set_value(g.doctype, g.name, "allocated", 0);
		frappe.model.set_value(g.doctype, g.name, "tax_allocated", 0);
	});
	$.each(frm.doc.customer_return,  function(i,  g) {
		g.allocated=0;
		frappe.model.set_value(g.doctype, g.name, "allocated", 0);
	});
	frm.doc.allocated_payment=0;
	frm.doc.allocated_idr_payment=0;
	frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment + frm.doc.total_idr_advance;
	frm.doc.unallocated_payment=frm.doc.total_gold_payment + frm.doc.total_gold;
	//frm.doc.unallocated_write_off=0;
	frm.doc.write_off=0;
	frm.doc.write_off_idr=0;
	frm.doc.write_off_total=0;
	frm.doc.jadi_deposit=0;
	refresh_field("allocated_idr_payment");
	refresh_field("allocated_payment");
	refresh_field("unallocated_idr_payment");
	refresh_field("unallocated_payment");
	//refresh_field("unallocated_write_off");
	refresh_field("write_off");
	refresh_field("write_off_idr");
	refresh_field("write_off_total");
	refresh_field("jadi_deposit");
	//frappe.msgprint("Reset Called");
	refresh_total_and_charges(frm);
	calculate_table_advance(frm);
	frappe.msgprint("Karena ad aperubahan nilai, maka data alokasi dan write off telah ter reset!!");
}
function calculate_table_idr(frm,cdt,cdn){
	var total=0;
	$.each(frm.doc.idr_payment,  function(i,  g) {
		total=total+g.amount;
	});
	frm.doc.total_idr_payment=total;
	frm.doc.total_idr_gold=total/frm.doc.tutupan;
	refresh_field("total_idr_payment");
	refresh_field("total_idr_gold");
	//calculate total payment
	frm.doc.total_payment=frm.doc.total_gold_payment+frm.doc.total_idr_in_gold;
	frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment + frm.doc.total_idr_advance;
	frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_idr_gold-frm.doc.allocated_payment;
	//frappe.msgprint("Callculate IDR");
	refresh_field("total_payment");
	refresh_field("unallocated_payment");
	refresh_field("unallocated_idr_payment");
	if(frm.doc.allocated_payment!=0){
		reset_allocated(frm);
	}else if(frm.doc.allocated_idr_payment!=0){
		reset_allocated(frm);
	}
}

function calculate_table_stock(frm,cdt,cdn){
	var d=locals[cdt][cdn];
	// frappe.model.set_value(cdt, cdn,"amount",d.rate*d.qty/100);
	var total=0;
	$.each(frm.doc.stock_payment,  function(i,  g) {
		total=total+g.amount;
	});
	frm.doc.total_gold_payment=total;
	refresh_field("total_gold_payment");
	//calculate total payment
	frm.doc.total_payment=frm.doc.total_gold_payment+frm.doc.total_idr_gold;
	refresh_field("total_payment");
	reset_allocated(frm);
	/*frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment+frm.doc.total_idr_advance;
	frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_gold;
	//frappe.msgprint("Callculate Stock");
	refresh_field("unallocated_payment");
	refresh_field("unallocated_idr_payment");*/
}

frappe.ui.form.on("Gold Invoice Advance IDR", {
	idr_allocated: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		if (d.idr_allocated > d.idr_deposit) {
			frappe.model.set_value(cdt, cdn, "idr_allocated", 0);
			frappe.throw("Allocated cant be higher than deposit value");
		}
		var idr = 0;
		$.each(frm.doc.invoice_advance, function (i, g) {
			if (g.idr_allocated) {
				idr = idr + g.idr_allocated;
			}
		});
		frm.doc.total_idr_in_gold = idr / frm.doc.tutupan;
		frm.doc.total_idr_advance=idr;
		frm.doc.total_advance = frm.doc.total_gold + frm.doc.total_idr_in_gold;
		/*frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment+frm.doc.total_idr_advance;
		frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_gold-frm.doc.allocated_payment;
		refresh_field("unallocated_payment");
		refresh_field("unallocated_idr_payment");*/
		refresh_field("total_idr_in_gold");
		refresh_field("total_advance");
		//if(frm.doc.allocated_payment>0 || frm.doc.allocated_idr_payment>0){
			reset_allocated(frm);
		//}
	},
});
frappe.ui.form.on("Gold Invoice Advance Gold", {
	gold_allocated: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		if (d.gold_allocated > d.gold_deposit) {
			frappe.model.set_value(cdt, cdn, "gold_allocated", 0);
			frappe.throw("Allocated cant be higher than deposit value");
		}
		var gold = 0;
		$.each(frm.doc.gold_invoice_advance, function (i, g) {
			if (g.gold_allocated) {
				gold =gold+ g.gold_allocated;
			}
		});
		frm.doc.total_gold = gold;
		frm.doc.total_advance = frm.doc.total_gold + frm.doc.total_idr_in_gold;
		refresh_field("total_advance");
		refresh_field("total_gold");
		/*frm.doc.unallocated_idr_payment=frm.doc.total_idr_payment+frm.doc.total_idr_advance;
		frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_gold-frm.doc.allocated_payment;
		//frappe.msgprint("Gold Allocated");
		refresh_field("unallocated_payment");
		refresh_field("unallocated_idr_payment");*/
		//if(frm.doc.allocated_payment>0 || frm.doc.allocated_idr_payment>0){
			reset_allocated(frm);
		//}
	},
});

frappe.ui.form.on('Gold Payment', {
	// onload: function(frm) {
    //     // Get the input field element
    //     var inputField = cur_frm.get_field('tutupan').$input;

    //     // Attach keydown event listener
    //     inputField.keydown(function(event) {
    //         // Check if the Enter key is pressed
    //         if (event.which === 13) {
    //             // Prevent the default Enter key action
    //             event.preventDefault();
    //             return false;
    //         }
    //     });
    // },
	validate:function(frm){
		//validate allocated amount
		if (frm.doc.list_janji_bayar && frm.doc.list_janji_bayar.length>0){
			cur_frm.doc.janji_bayar=frm.doc.list_janji_bayar[0].janji_bayar;
			refresh_field("janji_bayar");
		}
		$.each(frm.doc.invoice_table,  function(i,  g) {
			if (g.allocated>g.outstanding){
				frappe.msgprint("Nota "+g.gold_invoice+" nilai alokasi salah");
				return false;
			}
		});
		$.each(frm.doc.customer_return,  function(i,  g) {
			if (g.allocated>g.outstanding){
				frappe.msgprint("Customer Return "+g.invoice+" nilai alokasi salah");
				return false;
			}
		});
		
	},
	discount:function(frm){
		if (frm.doc.discount<0){
			return
		}
		frm.doc.discount_amount=frm.doc.bruto_discount*frm.doc.discount/100;
		refresh_field("discount_amount");
		refresh_total_and_charges(frm);
	},
	bruto_discount:function(frm){
		if (frm.doc.discount<0){
			return
		}
		/*var disc=0
		$.each(frm.doc.invoice_table,  function(i,  g) {
			if (g.allocated>0){
				disc=disc+(g.total_bruto/100*frm.doc.discount);
			}
		});*/
		frm.doc.discount_amount=frm.doc.bruto_discount*frm.doc.discount/100;
		refresh_field("discount_amount");
		refresh_total_and_charges(frm);
	},
	write_off:function(frm){
		refresh_total_and_charges(frm);
	},
	bonus:function(frm){
		refresh_total_and_charges(frm);
	},
	reset_alokasi:function(frm){
		reset_allocated(frm);
	},
	writeoff_sisa:function(frm){
		//need to change
		run_writeoff_sisa(frm);
	},
	jadikan_deposit:function(frm){
		//need to check
		frm.doc.jadi_deposit=frm.doc.unallocated_payment + (frm.doc.unallocated_idr_payment/frm.doc.tutupan);
		frm.doc.unallocated_payment=0;
		frm.doc.unallocated_idr_payment=0;
		frappe.msgprint("Total Deposit "+frm.doc.jadi_deposit);
		refresh_field("unallocated_payment");
		refresh_field("unallocated_idr_payment");
		refresh_field("jadi_deposit");
		//frm.dirty();
	},
	auto_distribute:function(frm){
		if (frm.doc.invoice_table==[] && frm.doc.customer_return==[]){
			frappe.throw("Tidak ada Invoice yang terpilih");
		}else{
			reset_allocated(frm);
			//payment rupiah selali di alokasikan ke pajak dulu apabila ada pajak
			if (frm.doc.total_pajak>0){
				var idr_need_to=frm.doc.unallocated_idr_payment;
				var total_allocated=0;
				$.each(frm.doc.invoice_table,  function(i,  g) {
					if (idr_need_to > g.outstanding_tax){
						g.tax_allocated=g.outstanding_tax;
					}else{
						g.tax_allocated=idr_need_to;
					}
					total_allocated = total_allocated + g.tax_allocated;
					idr_need_to=idr_need_to-g.tax_allocated;
				});
				frm.doc.unallocated_idr_payment=idr_need_to;
				frm.doc.allocated_idr_payment = total_allocated;
				refresh_field("allocated_idr_payment");
			}
			var idr_to_gold=0;
			if (frm.doc.unallocated_idr_payment>0){
				idr_to_gold = (frm.doc.unallocated_idr_payment/frm.doc.tutupan);
				idr_to_gold=parseFloat(idr_to_gold).toFixed(3);
			}
			var saldo_gold=frm.doc.unallocated_payment-frm.doc.total_extra_charges;
			var need_to= parseFloat(saldo_gold) + parseFloat(idr_to_gold);
			//frappe.msgprint("Need to "+need_to +" dari IDR "+idr_to_gold+" dari GOLD "+saldo_gold);
			// console.log(need_to)
			var sisa_invoice = parseFloat(cur_frm.doc.total_invoice) - parseFloat(need_to) + frm.doc.total_extra_charges ;
			if (sisa_invoice <0){
				sisa_invoice=0
			}
			cur_frm.set_value("total_sisa_invoice",sisa_invoice);
			refresh_field("total_sisa_invoice");
			need_to = parseFloat(need_to).toFixed(3);
			var total_alo=0;
			// console.log(need_to)
			if(need_to<=0){
				refresh_total_and_charges(frm);
				refresh_field("unallocated_idr_payment");
				//frappe.msgprint("Tidak ada pembayaran yang dapat di alokasikan");
				return;
			}
			$.each(frm.doc.customer_return,  function(i,  g) {
				var alo=0;
				if (need_to>(g.outstanding-g.allocated)){
					alo=g.outstanding-g.allocated;
					//cur_frm.doc.total_sisa_invoice = alo
				}else{
					alo=need_to;
				}
				total_alo=total_alo+alo;
				need_to=need_to-alo;
				frappe.model.set_value(g.doctype, g.name, "allocated", alo);
			});

			if (need_to>0) {
				$.each(frm.doc.invoice_table,  function(i,  g) {
					var alo=0;
					if (need_to>(g.outstanding-g.allocated)){
						alo=g.outstanding-g.allocated;
					}else{
						alo=need_to;
					}
					need_to=need_to-alo;
					total_alo=total_alo+alo;
					frappe.model.set_value(g.doctype, g.name, "allocated", g.allocated+alo);
				});
			}
			/*if (need_to<0){
				frappe.msgprint(" Test "+need_to);
				cur_frm.set_value("total_sisa_invoice",need_to*-1);
				need_to=0;*/
			//}else{
				
			//}	
			//refresh_field("total_sisa_invoice");
			if (idr_to_gold>0){
				var sisa_idr=parseFloat((idr_to_gold-(total_alo-saldo_gold))*frm.doc.tutupan).toFixed(0);
				frm.doc.unallocated_idr_payment=sisa_idr;
				cur_frm.set_value("unallocated_idr_payment",sisa_idr);
			}
			if (saldo_gold < total_alo){
				frm.doc.unallocated_payment=0;
				cur_frm.set_value("unallocated_payment",0);
			}else{
				var unaloc=parseFloat(saldo_gold- total_alo).toFixed(3);
				frm.doc.unallocated_payment=unaloc;
				cur_frm.set_value("unallocated_payment",unaloc);
			}
			//frappe.msgprint("Unallocated "+cur_frm.doc.unallocated_payment);
			cur_frm.set_value("allocated_payment",parseFloat(total_alo).toFixed(3));
			refresh_field("unallocated_idr_payment");
			refresh_field("unallocated_payment");
			refresh_field("allocated_payment");
			
			
			
			if((frm.doc.unallocated_idr_payment/frm.doc.tutupan) + frm.doc.unallocated_payment<=1/100){
				frappe.msgprint("Write off sisa Sedikit "+(frm.doc.unallocated_idr_payment/frm.doc.tutupan) + frm.doc.unallocated_payment);
				run_writeoff_sisa(frm);
			}else{
				refresh_total_and_charges(frm);	
			}
			frappe.msgprint("Pembayaran Telah di Alokasikan");
		}

	},
	tutupan:function(frm){
		cur_frm.get_field("tutupan").set_focus()
		frm.doc.total_idr_gold=frm.doc.total_idr_payment/frm.doc.tutupan;
		var idr = 0;
		$.each(frm.doc.invoice_advance, function (i, g) {
			if (g.idr_allocated) {
				idr = idr + g.idr_allocated;
			}
		});
		frm.doc.total_idr_in_gold = idr / frm.doc.tutupan;
		frm.doc.total_advance = frm.doc.total_gold + frm.doc.total_idr_in_gold;
		refresh_field("total_idr_payment");
		refresh_field("total_advance");
		refresh_field("total_idr_in_gold");
		refresh_field("total_idr_gold");
		//calculate total payment
		frm.doc.total_payment=frm.doc.total_gold_payment+frm.doc.total_idr_gold;
		refresh_field("total_payment");
		reset_allocated(frm);
	},
	get_gold_invoice:function(frm){
		// var button = cur_frm.get_field('get_gold_invoice').$input;
		// button.prop('disabled', true);
		// isButtonClicked = true;
		frappe.call({
			method: "get_gold_invoice",
			doc: frm.doc,
			callback: function (r){
				frm.refresh();
				reset_allocated(cur_frm);
				// setTimeout(function() {
				// 	// Check if the button was clicked and disable it
				// 	if (isButtonClicked) {
				// 		button.prop('disabled', true);
				// 	}
				// }, 0);
			}
		});
		
	},
	get_janji_bayar:function(frm){
		// var button = cur_frm.get_field('get_janji_bayar').$input;
		// button.prop('disabled', true);
		// isButtonClicked = true;
		if(cur_frm.doc.list_janji_bayar.length > 0){
			return false;
		}else{
			frappe.call({
				method: "get_janji_bayar",
				doc: frm.doc,
				callback: function (r){
					frm.refresh();	
					// setTimeout(function() {
					// 	// Check if the button was clicked and disable it
					// 	if (isButtonClicked1) {
					// 		button.prop('disabled', true);
					// 	}
					// }, 0);
				}
			});
		}
	},
	refresh: function(frm) {
		// Get the input field element
        // var inputField = cur_frm.get_field('tutupan').$input;

        // // Attach keydown event listener
        // inputField.keydown(function(event) {
        //     // Check if the Enter key is pressed
        //     if (event.which === 13) {
        //         // Prevent the default Enter key action
        //         event.preventDefault();
        //         return false;
        //     }
        // });
		frm.set_query("item","stock_payment", function(doc, cdt, cdn) {
			return {
				"filters": {
					"available_for_stock_payment":1
				}
			};

		});
		frm.set_query("janji_bayar","list_janji_bayar", function(doc, cdt, cdn) {
			return {
				"filters": {
					"customer":doc.customer,
					"jenis_janji":"Pembayaran",
					"status":"Pending"
				}
			};

		});
		frm.set_query("gold_invoice","invoice_table", function(doc, cdt, cdn) {
			return {
				"filters": {
					"docstatus":1,
					"invoice_status":"Unpaid",
					"customer":doc.customer
				}
			};

		});
		frm.set_query("sales_bundle", function(){
			return {
				"filters": [
				["Sales Stock Bundle", "aktif", "=", "1"],
				]
			}
		});

		frm.set_query("customer_deposit", "invoice_advance", function (doc, cdt, cdn) {
			return {
				query: "lestari.gold_selling.doctype.customer_deposit.customer_deposit.get_idr_advance",
				filters: { customer: doc.customer ,subcustomer:doc.subcustomer},
			};
		});
		frm.set_query("customer_deposit", "gold_invoice_advance", function (doc, cdt, cdn) {
			return {
				query: "lestari.gold_selling.doctype.customer_deposit.customer_deposit.get_gold_advance",
				filters: { customer: doc.customer , subcustomer:doc.subcustomer },
			};
		});
		if(!frm.doc.tutupan){
			frappe.call({
				method: "lestari.gold_selling.doctype.gold_rates.gold_rates.get_latest_rates",
				args:{type:frm.doc.type_emas},
				callback: function (r){
					frm.doc.tutupan=r.message.nilai;
					refresh_field("tutupan");

				}
			});
		}
		if(frm.doc.docstatus > 0) {
			cur_frm.add_custom_button(__('Accounting Ledger'), function() {
				frappe.route_options = {
					voucher_no: frm.doc.name,
					from_date: frm.doc.posting_date,
					to_date: moment(frm.doc.modified).format('YYYY-MM-DD'),
					company: frm.doc.company,
					group_by: "Group by Voucher (Consolidated)",
					show_cancelled_entries: frm.doc.docstatus === 2
				};
				frappe.set_route("query-report", "General Ledger");
			}, __("View"));
			cur_frm.add_custom_button(__("Stock Ledger"), function() {
				frappe.route_options = {
					voucher_no: me.frm.doc.name,
					from_date: me.frm.doc.posting_date,
					to_date: moment(me.frm.doc.modified).format('YYYY-MM-DD'),
					company: me.frm.doc.company,
					show_cancelled_entries: me.frm.doc.docstatus === 2
				};
				frappe.set_route("query-report", "Stock Ledger");
			}, __("View"));
		}
	},
	/*type_payment:function(frm){
		frm.doc.idr_payment=[];
		frm.doc.stock_payment=[];
		refresh_field("stock_payment");
		refresh_field("idr_payment")
	},*/
	type_emas:function(frm){
		frm.doc.stock_payment=[];
		refresh_field("stock_payment");
		frappe.call({
                                method: "lestari.gold_selling.doctype.gold_rates.gold_rates.get_latest_rates",
                                args:{type:frm.doc.type_emas},
                                callback: function (r){
                                        frm.doc.tutupan=r.message.nilai;
                                        refresh_field("tutupan")

                                }
                        });
	}

});

frappe.ui.form.on('Gold Payment Invoice', {
	gold_invoice:function(frm,cdt,cdn) {
		calculate_table_invoice(frm,cdt,cdn);
	},
	allocated:function(frm,cdt,cdn) {
		calculate_table_invoice_alo(frm,cdt,cdn);
		
	},
	invoice_table_remove: function(frm,cdt,cdn){
		calculate_table_invoice(frm,cdt,cdn);
		reset_allocated(frm);
	}
});
frappe.ui.form.on('Gold Payment Return', {
	invoice:function(frm,cdt,cdn) {
		calculate_table_invoice(frm,cdt,cdn);
		frappe.model.set_value(cdt, cdn,"allocated",0);
	},
	allocated:function(frm,cdt,cdn) {
		calculate_table_invoice_alo(frm,cdt,cdn);
		
	}
});
frappe.ui.form.on('IDR Payment', {
	amount:function(frm,cdt,cdn) {
		calculate_table_idr(frm,cdt,cdn)
	},
	idr_payment_remove:function(frm,cdt,cdn){
		calculate_table_idr(frm,cdt,cdn)
	}
});
frappe.ui.form.on('Gold Payment Charges', {
	category:function(frm,cdt,cdn) {
		var d=locals[cdt][cdn];
		d.amount=0
		d.gold_amount=0
		frappe.model.set_value(cdt, cdn,"gold_amount",0);
		frappe.model.set_value(cdt, cdn,"amount",0);
	},
	gold_amount:function(frm,cdt,cdn) {
		calculate_table_charges(frm,cdt,cdn)
	},
	amount:function(frm,cdt,cdn) {
		var d=locals[cdt][cdn];
		if(d.type=="IDR"){
			frappe.model.set_value(cdt, cdn,"gold_amount",d.amount/frm.doc.tutupan);
		}
		//calculate_table_charges(frm,cdt,cdn)
	}
});
function calculate_table_charges(frm,cdt,cdn){
	var d=locals[cdt][cdn];
	var total=0;
	$.each(frm.doc.other_charges,  function(i,  g) {		
		total=total+g.gold_amount;
	});
	frm.doc.total_biaya_tambahan=total;
	refresh_field("total_biaya_tambahan");
	if(frm.doc.allocated_payment>0){
		reset_allocated(frm);
	}else{
		frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_advance-frm.doc.allocated_payment;
	}
	
}
frappe.ui.form.on('Stock Payment', {
	item:function(frm,cdt,cdn) {
		// your code here
		var d=locals[cdt][cdn];
		if(!d.item){return;}
		frappe.call({
			method: "lestari.gold_selling.doctype.gold_invoice.gold_invoice.get_gold_purchase_rate",
			args:{"item":d.item,"customer":frm.doc.customer,"customer_group":frm.doc.customer_group},
			callback: function (r){
				frappe.model.set_value(cdt, cdn,"rate",r.message.nilai);
				frappe.model.set_value(cdt, cdn,"amount",parseFloat(r.message.nilai)*d.qty/100);
				var total=0;
				$.each(frm.doc.stock_payment,  function(i,  g) {
					total=total+g.amount;
				});
				frm.doc.total_gold_payment=total;
				refresh_field("total_gold_payment");
				//calculate total payment
				frm.doc.total_payment=frm.doc.total_gold_payment+frm.doc.total_idr_gold;
				refresh_field("total_payment");
				frm.doc.unallocated_payment=frm.doc.total_gold_payment+frm.doc.total_advance-frm.doc.allocated_payment;
				refresh_field("unallocated_payment");
			}
		});
	},
	qty:function(frm,cdt,cdn) {
		var d=locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn,"amount",d.rate*d.qty/100);
		calculate_table_stock(frm,cdt,cdn)
	},
	rate:function(frm,cdt,cdn) {
		var d=locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn,"amount",d.rate*d.qty/100);
		calculate_table_stock(frm,cdt,cdn)
	},
	stock_payment_remove:function(frm,cdt,cdn){
		calculate_table_stock(frm,cdt,cdn)
	}
	
});

frappe.ui.form.on('Gold Invoice Advance IDR', {
	invoice_advance_remove: function(frm,cdt,cdn){
		// console.log("IDR Remove")
		calculate_table_advance(frm,cdt,cdn)
	}
});
frappe.ui.form.on('Gold Invoice Advance Gold', {
	gold_invoice_advance_remove: function(frm,cdt,cdn){
		// console.log("Gold Remove")
		calculate_table_advance(frm,cdt,cdn)
	}
});

frappe.ui.form.on('Gold Payment Return', {
	gold_invoice_advance_remove: function(frm,cdt,cdn){
		// console.log("Gold Remove")
		calculate_table_advance(frm,cdt,cdn)
	}
});

frappe.ui.form.on('Gold Payment Stock Return', {
	rate: function(frm,cdt,cdn){
		calculate_stock_return(frm,cdt,cdn)
	},
	bruto: function(frm,cdt,cdn){
		calculate_stock_return(frm,cdt,cdn)
	},
	stock_return_transfer_remove: function(frm,cdt,cdn){
		calculate_stock_return(frm,cdt,cdn)
	}
});



function calculate_table_advance(frm,cdt,cdn){
	var total_gold=0;
	var total_idr=0;
	var allocated=0;
	$.each(frm.doc.invoice_advance,  function(i,  g) {
		total_idr=total_idr+g.idr_allocated;
		allocated=allocated+parseFloat(g.idr_allocated/frm.doc.tutupan);
	});
	$.each(frm.doc.gold_invoice_advance,  function(i,  g) {
		total_gold=total_gold+g.gold_allocated;
		allocated=allocated+g.gold_allocated;
	});
	// frm.doc.total_invoice=total;
	//frappe.model.set_value(cdt, cdn,"allocated",0);
	// refresh_field("total_invoice");
	frm.doc.total_gold=total_gold ;
	frm.doc.total_idr_advance = total_idr;
	frm.doc.total_idr_in_gold= parseFloat(total_idr) / parseFloat(frm.doc.tutupan) ;
	frm.doc.total_advance=allocated ;
	refresh_field("total_gold");
	refresh_field("total_idr_in_gold");
	refresh_field("total_advance");
	refresh_field("total_idr_advance");
	// frm.doc.unallocated_payment=frm.doc.total_payment + frm.doc.total_advance -frm.doc.allocated_payment;
	// refresh_field("unallocated_payment");
}
